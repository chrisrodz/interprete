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
  var db = req.db;
  db.collection('reservations').find().toArray(function(err, items) {
    if (err) {console.log(err);};
    if (req.session.err) {
      var msg = req.session.err;
      req.session.err = null;
    };
    res.render('reservations', {hours: req.session.user.availableHours, userReservations: items, msg: msg});
  });
});

router.post('/add', restrict, function(req, res) {
  var db = req.db;

  var reservationInfo = req.body;
  reservationInfo.user_id = db.ObjectID.createFromHexString(req.session.user._id);

  var consumedHours = (Math.abs(moment(req.body.beginTime, "HH:mm a").diff(moment(req.body.endTime, "HH:mm a"))))/3600000;

  if (consumedHours > req.session.user.availableHours) {
    req.session.err = "Not enough hours";
    res.redirect("/reservations");
  } else{
    db.collection('reservations').insert(reservationInfo, function(err, result) {
      res.sendgrid.send({
        to:       req.session.user.email,
        from:     'christian.etpr10@gmail.com',
        subject:  'Interprete Reservation',
        text:     'You just made a reservation using interprete! Must be exciting! Here is the info. Date: '
                  + req.body.reservationDate + ". From: " + req.body.beginTime + " To: " + req.body.endTime
      }, function(err, json) {
        if (err) { req.session.err = err; }
        console.log(json);
      });
      db.collection('usercollection').update({_id: db.ObjectID.createFromHexString(req.session.user._id)}, {$set: {availableHours: req.session.user.availableHours - consumedHours}}, function(err) {
        if (err) {req.session.err = err};
        db.collection('usercollection').findOne({email: req.session.user.email}, function(err, result) {
          req.session.user = result;
          res.redirect('/reservations');
        });
      });
    });
  };
});

router.get('/get', restrict, function(req, res) {
  var db = req.db;
  db.collection('reservations').find({user_id: db.ObjectID.createFromHexString(req.session.user._id)}).toArray(function(err, items) {
    res.json(items);
  });
});

router.get('/add-password', restrict, function(req, res) {
  res.render('add_password', {user: req.session.user});
});

router.post('/add-password', restrict, function(req, res) {
  var db = req.db;
  var pass = req.body.password;
  db.collection("passwords").findOne({password: pass}, function(err, result) {
    if (err || result.used) {
      res.render('add_password', {user: req.session.user, msg: err + ' Password used: ' + result.used});
    } else{
      db.collection("usercollection").update({_id: db.ObjectID.createFromHexString(req.session.user._id.toString())}, {$inc: {availableHours: result.hours}}, function(err) {
        if (err) {
          res.render("add_password", {user: req.session.user, msg: err});
        } else{
          db.collection("passwords").update({_id: db.ObjectID.createFromHexString(result._id.toString())}, {$set: {used_date: new Date(), used: true, user_id: db.ObjectID.createFromHexString(req.session.user._id.toString())}}, function(err) {
            if (err) {
              res.render("add_password", {user: req.session.user, msg: err});
            } else{
              db.collection('usercollection').findOne({_id: db.ObjectID.createFromHexString(req.session.user._id)}, function(err, user) {
                req.session.user = user;
                res.render("add_password", {user: req.session.user, msg: "Added hours!"});
              });
            };
          });
        };
      });
    };
  });
});

module.exports = router;
