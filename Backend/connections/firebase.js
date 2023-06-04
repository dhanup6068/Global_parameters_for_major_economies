const firebase = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

let _db;

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

exports.connect = () => {
  _db = firebase.firestore();
  console.log("Firebase connected");
  return _db;
}

exports.getConnection = () => _db;