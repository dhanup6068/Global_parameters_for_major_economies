const mysql = require('../connections/mysql');
const mongo = require('../connections/mongo');
const FB = require('../connections/firebase');

exports.isDuplicateFile = function (file) {
  const { name, parentInode } = file;
  return mysql.query(`select * from FileMetaData where name = ? and parentInode = ?`, [name, parentInode]);
};

exports.getPath = function (inode) {
  return mysql.query(`select *, concat(path, inode) childPath from FileMetaData where inode = ?`, [inode], 0);
}

exports.updateFolderSize = function (inode, size) {
  return mysql.query(`update FileMetaData set size = size + ? where inode in (?)`, [size, inode]);
}

exports.mysqlGetPartition = blockId => {
  return mysql.query(`select * from FileData where blockId = ?`, [blockId], 0)
    .then(partition => {
      if (!partition) throw new Error("Partition not found.");
      return partition;
    })
    .catch(err => { throw new Error(err.message || "Error getting partition.") });
}

exports.mysqlGetPartitions = async inode => {
  const fileData = await mysql.query(`select name, parentInode, partitionedOn from FileMetaData where inode = ?`, [inode], 0);
  if (!fileData) throw new Error("File not found.");

  if (fileData.type === 0) throw new Error("Cannot get partitions for a directory.");

  return mysql.query(`select blockId, partitionValue from FileData where inode = ?`, [inode])
    .then(partitions => {
      if (!partitions) throw new Error("Partitions not found.");
      return { fileName: fileData.name, parentInode: fileData.parentInode, partitionedOn: fileData.partitionedOn, partitions };
    })
}

exports.mongoGetPartitions = async (inode, filters = null) => {
  filters && console.log("Getting partitions with filters:", filters);
  const db = await mongo.getConnection();
  const fileData = await db.collection("FileMetaData").findOne({ inode }).catch(err => { throw new Error(err.message || "Error getting file data.") });

  if (!fileData) throw new Error("File not found.");

  if (fileData.type === 0) throw new Error("Cannot get partitions for a directory.");

  console.log("Getting partitions for file:", fileData.name);
  const partitions = await db.collection("FileData").find(filters || { inode }, { projection: { partitionValue: 1, blockId: 1, _id: 0 } }).toArray().catch(err => { throw new Error(err.message || "Error getting partitions.") });
  return { fileName: fileData.name, parentInode: fileData.parentInode, partitionedOn: fileData.partitionedOn, partitions };
}

exports.mongoGetPartition = async (blockId, filter = null) => {
  console.log("Getting partition with filter::::", filter);
  const db = await mongo.getConnection();
  return db
    .collection("FileData")
    .findOne(filter || { blockId })
    .then((result) => {
      if (!result) throw new Error("Partition not found.");
      return result;
    })
    .catch(err => { throw new Error(err.message || "Error getting partition.") });
}

exports.firebaseGetPartitions = async inode => {
  const db = FB.getConnection();
  const fileData = await db.collection("FileMetaData").doc(inode).get().then(file => file.data()).catch(err => { throw new Error(err.message || "Error getting file data.") });
  
  if (!fileData) throw new Error("File not found.");

  if (fileData.type === 0) throw new Error("Cannot get partitions for a directory.");

  console.log("Getting partitions for file:", fileData.name);
  return db
    .collection("FileData")
    .where("inode", "==", inode)
    .select("blockId", "partitionValue")
    .get()
    .then(files => files
      .docs
      .map(file => file.data())
      .sort((a, b) => {
        const aParts = a.partitionValue.split("-");
        const bParts = b.partitionValue.split("-");
        return +aParts[1] - +bParts[1];
      }))
    .then(partitions => {
      if (!partitions) throw new Error("Partitions not found.");
      return { fileName: fileData.name, parentInode: fileData.parentInode, partitionedOn: fileData.partitionedOn, partitions };
    })
    .catch(err => { throw new Error(err.message || "Error getting partitions.") });
}

exports.firebaseGetPartition = async blockId => {
  const db = FB.getConnection();
  return db
    .collection("FileData")
    .doc(blockId)
    .get()
    .then(partition => {
      if (!partition.exists) throw new Error("Partition not found.");
      return partition.data();
    })
    .catch(err => { throw new Error(err.message || "Error getting partition.") });
}