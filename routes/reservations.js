var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('reservations');
});

router.post('/add', function(req, res) {
  var db = req.db;
  db.collection('reservations').insert(req.body, function(err, result) {
    res.send(
      (err === null) ? {msg: ''} : {msg: err}
    );
  });
});

router.get('/get/:id', function(req, res) {
  var db = req.db;
  db.collection('reservations').find({userId: req.params.id}).toArray(function(err, items) {
    res.json(items);
  });
});

module.exports = router;
