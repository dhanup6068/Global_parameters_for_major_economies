const mysql = require('mysql');
const mysqConfig = require('../config.json').mysql;

let _connection = null;

exports.connect = () => {
  _connection = mysql.createConnection({
    host: mysqConfig.host,
    user: mysqConfig.user,
    password: mysqConfig.password,
    database: mysqConfig.database
  });
  _connection.connect();
  
}

exports.getConnection = () => _connection;

exports.query = (query, params = [], index) => {
  return new Promise((resolve, reject) => {
    sql = _connection.query(query, params, (err, results) => {
      // console.log("query:", sql.sql);
      if (err) return reject(err);
      if (index !== undefined) return resolve(results[index]);
      return resolve(results);
    });
  });
};