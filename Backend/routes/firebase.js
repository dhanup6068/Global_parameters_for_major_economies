const express = require('express');
const router = express.Router({ mergeParams: true });
const FB = require('../connections/firebase');
const firebaseAdmin = require("firebase-admin");
const asyncModule = require('async');
const uuid = require('uuid').v4;
const csvtojson = require('csvtojson');
const fs = require('fs').promises;
const _ = require('lodash');
const FilesHelper = require('../modules/files');
const moment = require("moment");

module.exports = () => {

  router.get('/ping', (req, res) => res.json({ status: 200, message: "Firebase pong." }));

  router.get('/files', async (req, res, next) => {
    const { parentId = "100" } = req.query;
    const db = FB.getConnection();

    return asyncModule.parallel({
      parent: (cb) => {
        db
          .collection("FileMetaData")
          .doc(parentId)
          .get()
          .then((parent) => cb(null, parent.data()))
          .catch((err) => cb(err));
      },
      files: (cb) => {
        db
          .collection("FileMetaData")
          .where("parentInode", "==", parentId)
          .get()
          .then((files) => cb(null, files.docs.map((file) => file.data())))
          .catch((err) => cb(err));
      }
    }, (err, results) => {
      if (err) return next(err);
      return res.status(200).json({ status: 200, ...results });
    })
  });

  router.post('/file', async (req, res, next) => {
    const { fileName, parentId = 100, partitionOn } = req.body;
    if (!req.files) return next({ status: 400, message: "File is required." });
    const file = req.files[0];

    if (!fileName) return next({ status: 400, message: "File name is required." });
    if (!file) return next({ status: 400, message: "File is required." });
    if (!partitionOn) return next({ status: 400, message: "Partition on is required." });

    const extension = file.mimetype.split("/")[1];
    if (!["csv", "json"].includes(extension)) return next({ status: 400, message: "Only json or csv allowed." });

    const fileContent = extension === "json" ? JSON.parse(await fs.readFile(file.path)) : await csvtojson().fromFile(file.path);
    const groups = _.groupBy(fileContent, partitionOn);
    if (_.size(groups) === 1 && groups[undefined]) return next({ status: 400, message: "Partition column not found." });

    const fileColumns = _.uniq(_.flatten(fileContent.map(Object.keys)));
    const db = FB.getConnection();
    const parentData = await db.collection("FileMetaData").doc(parentId).get().then((parent) => parent.data());

    if (!parentData) return next({ status: 400, message: "Parent not found." });

    const { size, type = 1 } = file;

    const inode = uuid();
    const batch = db.batch();
    const FileMetaDataRef = db.collection("FileMetaData").doc(inode);
    batch.set(FileMetaDataRef, {
      inode,
      name: fileName,
      extension,
      size,
      type,
      parentInode: parentId,
      partitionedOn: partitionOn,
      createdAt: new Date(),
      path: `${parentData.path}${inode}/`,
      fileColumns
    })

    const parents = parentData.path.split("/").filter(p => p.length && p !== "1");
    await parents.forEach(async parent => {
      const parentRef = db.collection("FileMetaData").doc(parent);
      batch.update(parentRef, { size: firebaseAdmin.firestore.FieldValue.increment(size) });
    })

    batch.commit();

    const promises = [];
    for (const [partitionValue, data] of Object.entries(groups)) {
      const contentSize = Buffer.byteLength(JSON.stringify(data));
      const MBs = Math.ceil(contentSize / (1024 * 1024));
      const chunks = _.chunk(data, Math.ceil(data.length / MBs));
      console.log("Uploading partition:", partitionValue, "with size:", contentSize, "and split to:", MBs);

      const partitionBatch = db.batch();
      for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i];
        const blockId = uuid();
        const chunkRef = db.collection("FileData").doc(blockId);
        const partValue = `${partitionValue}${chunks.length === 1 ? "" : `-${i + 1}`}`;
        chunk = chunk.map(row => {
          return Object.keys(row).reduce((acc, key) => {
            return { ...acc, [key]: +row[key] == row[key] ? +row[key] : row[key] }
          }, {});
        })
        console.log("Uploading part:", partValue);
        partitionBatch.set(chunkRef, {
          blockId,
          inode,
          partitionValue: partValue,
          data: chunk,
          createdAt: new Date()
        });
        if (i === 499)
          await partitionBatch.commit().then(() => console.log("Partition batch committed.")).catch((err) => console.log("Partition batch error:", err));
      }
      promises.push(partitionBatch.commit().then(() => console.log("Chunk committed.")).catch((err) => console.log("Chunk commit error:", err)));
    }
    await Promise.all(promises).then(() => console.log("All chunks committed.")).catch((err) => console.log("All chunks commit error:", err));

    return res.status(200).json({ status: 200, message: "File uploaded successfully." });
  });

  router.post("/folder", async (req, res, next) => {
    const { name, parentId = "100", size = 0, type = 0 } = req.body;
    if (!name) return next({ status: 400, message: "Folder name is required." });

    const db = FB.getConnection();
    const parentData = await db.collection("FileMetaData").doc(parentId).get().then((parent) => parent.data());

    if (!parentData) return next({ status: 400, message: "Parent folder not found." });

    const inode = uuid();
    return db
      .collection("FileMetaData")
      .doc(inode)
      .set({
        name,
        size,
        type,
        inode,
        parentInode: parentId,
        path: `${parentData.path}${inode}/`
      })
      .then(result => res.json({ status: 200, message: "Folder added successfully." }))
      .catch((err) => next(err));
  })

  router.delete("/file/:inode", async (req, res, next) => {
    const { inode } = req.params;
    const db = FB.getConnection();

    const fileData = await db.collection("FileMetaData").doc(inode).get().then((file) => file.data()).catch(next);
    if (!fileData) return next({ status: 404, message: "File not found." });
    if (fileData.type === 0) return next({ status: 400, message: "Only files can be deleted." });
    const batch = db.batch();

    const { size } = fileData;
    const parents = fileData.path.split("/").filter(p => p.length && p !== "1");
    parents.forEach(parent => {
      const parentRef = db.collection("FileMetaData").doc(parent);
      batch.update(parentRef, { size: firebaseAdmin.firestore.FieldValue.increment(-size) });
    })
    console.log("Updated parents on delete.");

    const FileMetaDataRef = db.collection("FileMetaData").doc(inode);
    batch.delete(FileMetaDataRef);
    const FileDataRef = db.collection("FileData").doc(inode);
    batch.delete(FileDataRef);

    return batch
      .commit()
      .then(() => res.status(200).json({ status: 200, message: "File deleted successfully." }))
      .catch(next);
  });

  router.get("/cat/:inode", async (req, res, next) => {
    const { inode } = req.params;
    const db = FB.getConnection();

    const fileData = await db.collection("FileMetaData").doc(inode).get().then((file) => file.data());
    if (!fileData) return next({ status: 404, message: "File not found." });

    return db
      .collection("FileData")
      .where("inode", "==", inode)
      .get()
      .then((files) => {
        return res.status(200).json({
          status: 200,
          fileName: fileData.name,
          parentInode: fileData.parentInode,
          data: _.shuffle(_.flatten(files.docs.map((file) => file.data().data)))
        })
      })
      .catch(next);
  });

  router.get("/getPartitions/:inode", async (req, res, next) => {
    const { inode } = req.params;
    return FilesHelper.firebaseGetPartitions(inode)
      .then(data => res.status(200).json({ status: 200, ...data }))
      .catch(next);
  });

  router.get("/getPartition/:blockId", async (req, res, next) => {
    const { blockId } = req.params;

    return FilesHelper.firebaseGetPartition(blockId)
      .then(data => res.status(200).json({ status: 200, partitionData: data.data }))
      .catch(next);
  });

  router.get("/columns/:inode", async (req, res, next) => {
    const { inode } = req.params;
    const db = FB.getConnection();

    const fileData = await db.collection("FileMetaData").doc(inode).get().then((file) => file.data()).catch(next);
    if (!fileData) return next({ status: 404, message: "File not found." });

    if (fileData.type === 0) return next({ status: 400, message: "Cannot get columns of a directory." });

    return res.status(200).json({ status: 200, ...fileData });
  });

  router.get("/search/:inode/:column", async (req, res, next) => {
    const { inode, column } = req.params;

    const { operator = "===", from = null, to = null } = req.query;
    let { searchValue = null } = req.query;
    searchValue = +searchValue == searchValue ? +searchValue : searchValue;
    console.log("serachValue:", searchValue, typeof(searchValue));

    const functions = {
      "===": (a, b) => a === b,
      "<": (a, b) => a < b,
      ">": (a, b) => a > b,
      "<=": (a, b) => a <= b,
      ">=": (a, b) => a >= b,
      "between": (a, _, from, to) => a >= from && a <= to
    }
    

    const { partitions } = await FilesHelper.firebaseGetPartitions(inode);

    return asyncModule.map(partitions, async partition => {
      const partitionData = await FilesHelper.firebaseGetPartition(partition.blockId);
      const { data } = partitionData;

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
      if (err) return next(err);
      results = _.flatten(results);
      if (!results.length) return next({ status: 404, message: "No results found." });
      return res.status(200).json({ status: 200, searchResults: results });
    })
  });

  return router;
}