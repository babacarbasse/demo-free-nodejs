var express = require("express");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var path = require("path");
const requestIp = require('request-ip');

var routes = require("./routes/index");
var cats = require("./routes/cats");
const { logger } = require("./utils/logger");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const logRequestStart = (req, res, next) => {
  const start = new Date();
  res.on("finish", () => {
    const durationRequest = new Date().getTime() - start.getTime();
    const clientIp = requestIp.getClientIp(req); 
    logger.info(
      `${clientIp} ${req.method} ${req.originalUrl} - - ${res.statusCode} ${res.statusMessage} - ${durationRequest} - ${req.header('user-agent')} - ${
        res.get("Content-Length") || 0
      }b sent`
    );
  });

  next();
};

app.use(logRequestStart);
app.use("/", routes);
app.use("/cats", cats);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  const clientIp = requestIp.getClientIp(req);
  logger.error(
    `${clientIp} ${req.method} ${req.originalUrl} - - ${res.statusCode} ${res.statusMessage} - 0 - ${req.header('user-agent')} - ${err.stack}`
  );
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});

app.listen(3000, () => {
  logger.info(`Server started on port 3000`);
});
