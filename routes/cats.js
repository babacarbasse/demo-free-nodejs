var express = require('express');
const { logger } = require('../utils/logger');
const requestIp = require('request-ip');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  const clientIp = requestIp.getClientIp(req);
  logger.debug(
    `${clientIp} ${req.method} ${req.originalUrl} - - 200 OK - 0 - ${req.header('user-agent')} - I'm in the cats module.`
  );
  res.send('respond with a resource');
});

/* GET something that just errors */
router.get('/broken', function(req, res) {
  const clientIp = requestIp.getClientIp(req);
  logger.error(
    `${clientIp} ${req.method} ${req.originalUrl} - - 500 Internal Server Error - 0 - ${req.header('user-agent')} - Oh noes, something has gone terribly wrong`
  );
  res.error("aargh");
});

module.exports = router;