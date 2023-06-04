const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const port = 3001;
require('./connections/mysql').connect();
require('./connections/mongo').connect();
require('./connections/firebase').connect();
const cors = require('cors');
const multer = require('multer');
const MYSQLRoutes = require('./routes/mysql');
const MongoDBRoutes = require('./routes/mongo');
const firebaseRoutes = require('./routes/firebase');

app.use(bodyparser.json());
app.use(multer({
  dest: '/tmp/'
}).any());

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => callback(null, true),
  allowedHeaders: "Accept, Origin, Content-Type, Authorization, Content-Length, X-Requested-With",
};

app.use(cors(corsOptions));
app.options("*", cors());

app.get('/ping', (req, res) => {
  return res.json({ status: 200, message: "pong" });
})

app.use("*", (req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
})

// localhost:3001/MYSQL
app.use("/MYSQL", MYSQLRoutes());
app.use("/MONGODB", MongoDBRoutes());
app.use("/FIREBASE", firebaseRoutes());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if ('OPTIONS' == req.method) {
    res.send(200);
  } else {
    next();
  }
});

app.use(function (req, res, next) {
  var err = new Error('Not Found ' + req.method + ' ' + req.url + "\n\n");
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  console.log("Global error catch:", err);
  return res.json({ status: err.status, message: err.message || "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`EDFS backend listening at http://localhost:${port}`)
});
