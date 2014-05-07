var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('layout', {user: req.session.user});
});

module.exports = router;