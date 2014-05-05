var express = require('express');
var router = express.Router();

function restrict (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/users/login');
    };
}

/* GET users listing. */
router.get('/', restrict, function(req, res) {
  res.render('reservations');
});

router.post('/add', restrict, function(req, res) {
  var db = req.db;
  db.collection('reservations').insert(req.body, function(err, result) {
    res.sendgrid.send({
      to:       'christian.etpr10@gmail.com',
      from:     'christian.etpr10@gmail.com',
      subject:  'Interprete Reservation',
      text:     'You just made a reservation using interprete! Must be exciting! Here is the info. Date: '
                + req.body.reservationDate + ". From: " + req.body.beginTime + " To: " + req.body.endTime
    }, function(err, json) {
      if (err) { return console.error(err); }
      console.log(json);
    });
    res.send(
      (err === null) ? {msg: ''} : {msg: err}
    );
  });
});

router.get('/get/:id', restrict, function(req, res) {
  var db = req.db;
  db.collection('reservations').find({userId: req.params.id}).toArray(function(err, items) {
    res.json(items);
  });
});

module.exports = router;
