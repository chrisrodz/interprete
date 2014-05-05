var express = require('express');
var moment = require('moment');
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
  res.render('reservations', {hours: req.session.user.availableHours});
});

router.post('/add', restrict, function(req, res) {
  var db = req.db;

  var reservationInfo = req.body;
  reservationInfo.user_id = db.ObjectID.createFromHexString(req.session.user._id);

  console.log(req.body);

  var consumedHours = (Math.abs(moment(req.body.beginTime, "HH:mm a").diff(moment(req.body.endTime, "HH:mm a"))))/3600000;

  if (consumedHours > req.session.user.availableHours) {
    res.send({msg: 'Not enough hours'});
  } else{
    db.collection('reservations').insert(reservationInfo, function(err, result) {
      res.sendgrid.send({
        to:       req.session.user.email,
        from:     'christian.etpr10@gmail.com',
        subject:  'Interprete Reservation',
        text:     'You just made a reservation using interprete! Must be exciting! Here is the info. Date: '
                  + req.body.reservationDate + ". From: " + req.body.beginTime + " To: " + req.body.endTime
      }, function(err, json) {
        if (err) { return console.error(err); }
        console.log(json);
      });
      db.collection('usercollection').update({_id: db.ObjectID.createFromHexString(req.session.user._id)}, {$set: {availableHours: req.session.user.availableHours - consumedHours}}, function(err) {
        if (err) {console.log(err)};
      });
      res.send(
        (err === null) ? {msg: ''} : {msg: err}
      );
    });
  };
});

router.get('/get', restrict, function(req, res) {
  var db = req.db;
  db.collection('reservations').find({user_id: db.ObjectID.createFromHexString(req.session.user._id)}).toArray(function(err, items) {
    res.json(items);
  });
});

module.exports = router;
