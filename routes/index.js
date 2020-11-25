var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
//   log.debug("This is in the index module");
  res.render('index', { title: 'Express updated!' });
});

module.exports = router;