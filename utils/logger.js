var winston = require("winston");
var config = winston.config;
var logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      timestamp: function () {
        return Date.now();
      },
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(info => `[${info.timestamp}] ${info.level} ${info.message}`),
      )
    }),
  ],
});

module.exports.logger = logger;
