var express = require('express');
var router = express.Router();

// Sendgrid for sending emails.
// Alex: No pongas tus credentials directo BAD! >:(
var sendgrid  = require('sendgrid')('makobi', 'culo1124estupido');

// Password hashing
var pwd = require('pwd');

function restrict (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('login');
    };
} 

router.get('/userlist', restrict, function(req, res) {
    if (req.session.user) {
      res.json(req.session.user)
    } else {
      var db = req.db;
      db.collection('usercollection').find().toArray(function (err, items) {
          res.json({msg: "la lista"});
      });
    };
});

/* GET New User page. */
router.get('/newuser', restrict, function(req, res, sendgrid) {
    res.render('newuser', { title: 'Add New User' });
});

/*
 * POST to adduser.
 */
router.post('/adduser', restrict, function(req, res) {
    var db = req.db;

    var newUser = req.body;

    pwd.hash(newUser.password, function(err, salt, hash) {
      if (err) throw err;
      // Save salt and hash to user object
      newUser.password = hash;
      newUser.salt = salt;
      newUser.availableHours = 0;
      newUser.accountIsActive = false;

      // Insert user into db
      db.collection('usercollection').insert(newUser, function(err, result) {
        sendgrid.send({
          to:       newUser.email,
          from:     'christian.etpr10@gmail.com',
          subject:  'interprete',
          text:     'Created a user in interprete app. Confirm user at this link: http://localhost:3000/users/confirm' + result[0]._id
        }, function(err, json) {
          if (err) { return console.error(err); }
          console.log(json);
        });
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
      });
    });
});

/*
* GET login page
*/
router.get('/login', function(req, res) {
  res.render('login');
});

/*
* POST login page
*/
router.post('/login', function(req, res) {
  var db = req.db;
  var userEmail = req.body.email;

  db.collection('usercollection').find({"email": userEmail}).toArray(function(err, items) {
    if (err || items.length < 1) {
      res.render('login', {msg: "Invalid login. Please try again."});
      return;
    } else {
      var user = items[0];
      pwd.hash(req.body.password, user.salt, function(pwderr, hash) {
        if (hash == user.password) {
          req.session.regenerate(function() {
              req.session.user = user;
              res.redirect('/reservations');
          });
        } else {
          res.render('login', {msg: "Invalid login. Please try again."});
        };
      });
    }
  });
});

/*
* GET User confirmation page. He gets here through email.
*/
router.get('/confirm/:userid', function(req, res) {
  var db = req.db;
  db.collection('usercollection').findOne({_id: db.ObjectID.createFromHexString(req.params.userid)}, function(err, user) {
    console.log(user);
    if (!user || err) {
      res.redirect('/users/newuser');
    } else{
      db.collection('usercollection').update({_id: user._id}, {$set: {accountIsActive: true}}, function(err) {
        res.redirect('/users/login');
      });
    };
  });
});


module.exports = router;
