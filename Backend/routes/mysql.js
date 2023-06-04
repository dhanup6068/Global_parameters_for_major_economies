const express = require('express');
const router = express.Router({ mergeParams: true });
const mysql = require('../connections/mysql');
const asyncModule = require('async');
const _ = require('lodash');
const fs = require('fs').promises;
const csvtojson = require("csvtojson/v2");
const FilesHelper = require('../modules/files');
const moment = require("moment");

module.exports = () => {
  router.get('/ping', (req, res) => {
    return res.json({ status: 200, message: "MYSQL pong" });
  })

  router.get('/files', async (req, res, next) => {
    req.query.parentId = req.query.parentId || 100;

    let where = "", params = [];
    if (req.query.parentId) {
      if (where.length) where += " and ";
      where += `fmd.parentInode = ?`;
      params.push(req.query.parentId);
    }
    let query = "select fmd.*, fe.extension from FileMetaData fmd left join FileExtensions fe on fmd.inode = fe.inode";

    if (where.length)
      query += " where " + where;

    const parentData = `select * from FileMetaData where inode = ?`;
    const parent = await mysql.query(parentData, [req.query.parentId], 0);

    if (parent?.type !== 0) return next({ status: 400, message: "Not a directory." });

    const files = await mysql.query(query, params);
    return res.status(200).json({ status: 200, files, parent });
  })

  router.post('/file', async (req, res, next) => {
    const { fileName, parentId = 100, partitionOn } = req.body;
    if (!req.files) return next({ status: 400, message: "File is required." });
    const file = req.files[0];

    if (!fileName) return next({ status: 400, message: "File name is required." });
    if (!file) return next({ status: 400, message: "File is required." });

    const extension = file.mimetype.split("/")[1];
    if (!["csv", "json"].includes(extension)) return next({ status: 400, message: "Only json or csv allowed." });

    const fileContent = extension === "json" ? JSON.parse(await fs.readFile(file.path)) : await csvtojson().fromFile(file.path);

    const groups = _.groupBy(fileContent, partitionOn);

    const fileColumns = _.uniq(_.flatten(fileContent.map(Object.keys)));
    console.log("Columns:", Object.keys(groups), fileColumns);

    if (_.size(groups) === 1 && groups[undefined]) return next({ status: 400, message: "Partition column not found." });

    const parentData = await FilesHelper.getPath(parentId)
      .catch(err => {
        console.log("Error in add file:", err);
        return res.json({ status: 500, message: err.message || "Parent not found. Invalid file creation." });
      });

    const { size, type = 1 } = file;

    const query = `insert into FileMetaData (name, size, type, parentInode, path, partitionedOn, fileColumns) values (?, ?, ?, ?, ?, ?, ?)`;
    const result = await mysql.query(query, [fileName, size, type, parentId, parentData.childPath + "/", partitionOn, JSON.stringify(fileColumns)])
      .catch(err => {
        console.log("Error in add file:", err);
        if (err.errno === 1062) throw next({ status: 409, message: "File already exists." });
        return res.json({ status: 500, message: err.message || "Error adding file." });
      });
    console.log("File meta data added!");
    const { insertId: inode } = result;
    const addDataPromises = [];
    addDataPromises.push(mysql.query(`insert into FileExtensions (inode, extension) values (?, ?)`, [inode, extension]));
    for (let key in groups) {
      groups[key] = groups[key].map(row => {
        return Object.keys(row).reduce((acc, curr) => {
          return {...acc, [curr]: +row[curr] == row[curr] ? +row[curr] : row[curr] };
        }, {});
      })

      const query = `insert into FileData (inode, data, partitionValue) values (?, ?, ?)`;
      addDataPromises.push(mysql.query(query, [inode, JSON.stringify(groups[key]), key]));
    }
    await Promise.all(addDataPromises);

    const parents = parentData.childPath.split("/").filter(p => p.length);
    await FilesHelper.updateFolderSize(parents, size);

    return res.status(200).json({ status: 200, message: "File added successfully." });
  })

  router.delete('/file/:inode', async (req, res, next) => {
    const { inode } = req.params;

    const fileData = await FilesHelper.getPath(inode);
    if (!fileData) return next({ status: 404, message: "File not found." });
    if (fileData.type === 0) return next({ status: 400, message: "Cannot delete a directory." });
    const { size } = fileData;

    return asyncModule.parallel({
      deleteFileMetadata: (cb) => {
        const query = `delete from FileMetaData where inode = ?`;
        return mysql
          .query(query, [inode])
          .then(() => cb(null, true))
          .catch(cb);
      },
      deleteFileExtensions: (cb) => {
        const query = `delete from FileExtensions where inode = ?`;
        return mysql
          .query(query, [inode])
          .then(() => cb(null, true))
          .catch(cb);
      },
      deleteFileData: (cb) => {
        const query = `delete from FileData where inode = ?`;
        return mysql
          .query(query, [inode])
          .then(() => cb(null, true))
          .catch(cb);
      },
      updateFolderSize: (cb) => {
        const parents = fileData.childPath.split("/").filter(p => p.length);
        FilesHelper.updateFolderSize(parents, -size)
          .then(res => cb(null, res))
          .catch(cb);
      }
    }, (err, results) => {
      if (err) return next({ status: 500, message: err.message || "Error deleting file." });
      return res.status(200).json({ status: 200, message: "File deleted successfully.", results });
    })
  })

  router.post("/folder", async (req, res, next) => {
    const { parentId, name } = req.body;
    if (!name) throw next({ status: 400, message: "Folder name is required." });

    const parentData = await FilesHelper.getPath(parentId)
      .catch(err => {
        console.log("Error in add folder:", err);
        return res.json({ status: 500, message: err.message || "Parent not found. Invalid file creation." });
      });

    const query = `insert into FileMetaData (name, parentInode, path) values (?, ?, ?)`;
    await mysql.query(query, [name, parentId, parentData.childPath + "/"])
      .catch(err => {
        console.log("Error in add folder:", err);
        if (err.errno === 1062) throw next({ status: 409, message: "Folder already exists." });
        throw next({ status: 500, message: err.message || "Internal server error" });
      });
    return res.status(200).json({ status: 200, message: "Folder created successfully!" });
  });

  router.get("/cat/:inode", async (req, res, next) => {
    const { inode } = req.params;
    const isFile = await mysql.query(`select name, parentInode from FileMetaData where inode = ? and type = 1`, [inode], 0);

    if (!isFile) throw next({ status: 400, message: "Not a file." });
    const data = await mysql.query(`select data from FileData where inode = ?`, [inode]);

    return res.status(200).json({ status: 200, fileName: isFile.name, parentInode: isFile.parentInode, data: _.shuffle(_.flatten(data.map(el => JSON.parse(el.data)))), message: "Got the data" });
  });

  router.get("/getPartitions/:inode", async (req, res, next) => {
    const { inode } = req.params;
    return FilesHelper.mysqlGetPartitions(inode)
      .then(data => {
        console.log("get partitions:", data);
        return res.status(200).json({ status: 200, ...data, message: "Got the partitions" })
      })
      .catch(next);
  });

  router.get("/getPartition/:blockId", async (req, res, next) => {
    const { blockId } = req.params;

    const partitionData = await FilesHelper.mysqlGetPartition(blockId);
    return res.status(200).json({ status: 200, partitionData: JSON.parse(partitionData.data) });
  });

  router.get("/columns/:inode", async (req, res, next) => {
    const { inode } = req.params;
    const file = await mysql.query(`select * from FileMetaData where inode = ?`, [inode], 0);

    if (!file) throw next({ status: 404, message: "File not found" });

    if (file.type === 0) return next({ status: 400, message: "Cannot get columns of a directory." });

    file.fileColumns = JSON.parse(file.fileColumns || "[]");

    return res.status(200).json({ status: 200, ...file });
  });

  router.get("/search/:inode/:column", async (req, res, next) => {
    const { inode, column } = req.params;

    const { operator = "===", searchValue = null, from = null, to = null } = req.query;

    const { partitions } = await FilesHelper.mysqlGetPartitions(inode).catch(next)

    const functions = {
      "===": (a, b) => a === b,
      "<": (a, b) => a < b,
      ">": (a, b) => a > b,
      "<=": (a, b) => a <= b,
      ">=": (a, b) => a >= b,
      "between": (a, _, from, to) => a >= from && a <= to
    }
    return asyncModule.map(partitions, async partition => {
      let data = await FilesHelper.mysqlGetPartition(partition.blockId).catch(next);
      data = JSON.parse(data.data);
      if (typeof (data[0][column]) === "string" && operator !== "===" && moment(data[0][column]).format() === "Invalid date") throw { status: 400, message: "Cannot have range/equality search on string columns." };
      
      let filteredData = [];
      if (operator === "between" && column === "timeStamp") {
        console.log("between and timestamp");
        filteredData = data.filter(row => moment(row[column]).isSameOrAfter(moment(from)) && moment(row[column]).isSameOrBefore(moment(to)));
      }
      else
        filteredData = data.filter(row => functions[operator](row[column], searchValue, from, to));
      return filteredData;
    }, (err, results) => {
      if (err) return next({ status: err.status || 500, message: err.message || "Error searching file." });
      results = _.flatten(results);
      if (!results.length) return next({ status: 404, message: "No results found." });
      return res.status(200).json({ status: 200, searchResults: results });
    })
  })
  return router;
}
