var express = require('express');
var router = express.Router();

// Sendgrid for sending emails.
// Alex: No pongas tus credentials directo BAD! >:(
var sendgrid  = require('sendgrid')('makobi', 'culo1124estupido');

// Password hashing
var pwd = require('pwd');

router.get('/userlist', function(req, res) {
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
router.get('/newuser', function(req, res, sendgrid) {
    res.render('newuser', { title: 'Add New User' });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
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
          text:     'Created a user in interprete app.'
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
    
    var user = items[0];
    pwd.hash(req.body.password, user.salt, function(pwderr, hash) {
      if (hash == user.password) {
        req.session.regenerate(function() {
            req.session.user = user;
            res.redirect('userList');
        });
      } else {
        res.json({msg: "Invalid login"});
      };
    });
  });
});


/*
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('usercollection').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;
