const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://edfs75User:tXIN0r0tXqGKR3BW@edfs75-cluster.vz5b1tv.mongodb.net/edfs75';
const client = new MongoClient(url);

const dbName = 'edfs75';

let _connection;

exports.connect = async () => {
  console.log("Connecting to MongoDB");
  await client.connect().catch(err => console.log("Error on connect to mongodb", err));
  console.log('Connected successfully to mongodb server');
  _connection = client.db(dbName);
  return _connection;
}

exports.getConnection = () => _connection;
