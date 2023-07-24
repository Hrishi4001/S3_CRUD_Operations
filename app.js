const createError = require("http-errors");
const express = require("express");

const getObjectRoute = require("./src/routes/getObject");
const storeObjectRoute = require("./src/routes/storeObject");
const deleteObjectRoute = require("./src/routes/deleteObject");
const getObjectsRoute = require("./src/routes/getObjects");
const getBucketsRoute = require("./src/routes/getBuckets");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/bucket", getObjectRoute);
app.use("/bucket", storeObjectRoute);
app.use("/bucket", deleteObjectRoute);
app.use("/bucket", getObjectsRoute);
app.use("/bucket", getBucketsRoute);

// ==== catch 404 and forward to error handler ====
app.use(function (req, res, next) {
  next(createError(404));
});

// ==== error handler ====
app.use(function (err, req, res, next) {
  // ==== set locals, only providing error in development ====
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // ==== render the error page ====
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
