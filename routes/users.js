var express = require('express');
var router = express.Router();

// Sendgrid for sending emails.
// Alex: No pongas tus credentials directo BAD! >:(
// var sendgrid  = require('sendgrid')('makobi', 'culo1124estupido');

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
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

/*
 * POST to adduser.
 */
router.post('/newuser', function(req, res) {
    var db = req.db;

    var newUser = req.body;

    newUser.availableHours = 0;
    newUser.accountIsActive = false;

    newUser.firstTime = true;

    // Insert user into db
    db.collection('usercollection').insert(newUser, function(err, result) {
      res.sendgrid.send({
        to:       newUser.email,
        from:     'christian.etpr10@gmail.com',
        subject:  'interprete',
        text:     'Created a user in interprete app. Confirm user at this link: http://localhost:3000/users/confirm/' + result[0]._id
      }, function(err, json) {
        if (err) { return console.error(err); }
        console.log(json);
      });
      res.render('confirm', {msg: 'email has been sent to ' + newUser.email})
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
              if (user.firstTime) {
                res.redirect('/users/userinfo');
              } else {
                res.redirect('/instructions');
              };
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
        res.redirect('/users/setpass/'+user._id);
      });
    };
  });
});

router.get('/logout', function (req, res) {
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function () {
        res.redirect('login');
    });
});

/*
* GET User confirmation page. He gets here through email.
*/
router.get('/userinfo', restrict, function(req, res) {
  var db = req.db;
  console.log(req.session.user.email);
  db.collection('usercollection').findOne({_id: db.ObjectID.createFromHexString(req.session.user._id)}, function(err, user) {
    req.session.user = user;
    if (!user.hasOwnProperty('type')){
      res.render('user_supp', {user: req.session.user});
    }
    else if (user.type === 'supplier') {
      res.render('suppinfo', {user: req.session.user});
    }
    else {
      res.render('userinfo', {user: req.session.user}); 
    };
  });
});

/*
* POST User confirmation page. He gets here through email.
*/
router.post('/userinfo', restrict, function(req, res) {
  var db = req.db;
  req.body._id = db.ObjectID.createFromHexString(req.session.user._id.toString());
  req.body.accountIsActive = req.session.user.accountIsActive;
  req.body.availableHours = req.session.user.availableHours;
  req.body.firstTime = req.session.user.firstTime;
  req.body.password = req.session.user.password;
  req.body.salt = req.session.user.salt;
  req.body.type = req.session.user.type;
  req.body.language = req.session.user.language;
  db.collection('usercollection').save(req.body, function(err) {
    if (err) {console.log(err)};
    db.collection('usercollection').findOne({_id: db.ObjectID.createFromHexString(req.session.user._id)}, function(err, user) {
      req.session.user = user;
      if (req.session.user.firstTime){
        db.collection('usercollection').update({_id: db.ObjectID.createFromHexString(req.session.user._id.toString())}, {$set: {firstTime: false} }, function(err) {
          res.redirect('/instructions'); 
        });
      }
      else{
          res.redirect('/users/userinfo');
      }
      //res.render('userinfo', {user: req.session.user});
    });
  });
});

/*
* GET User confirmation page. He gets here through email.
*/
router.get('/setpass/:userid', function(req, res) {
  res.render('setpass');
});

/*
* GET User confirmation page. He gets here through email.
*/
router.post('/setpass/:userid', function(req, res) {
  var db = req.db;
  pwd.hash(req.body.password, function(err, salt, hash) {
      if (err) throw err;
      // Save salt and hash to user object
      var pass = hash;
      var sal = salt;
      db.collection('usercollection').update({_id: db.ObjectID.createFromHexString(req.params.userid.toString())}, {$set: {password: pass, salt: sal} }, function(err) {
        if (err) {console.log(err)};
        res.redirect('/users/login');
      });

  });
});

router.post('/user_supp', restrict, function(req, res) { 
  var db = req.db;
  db.collection('usercollection').findOne({_id: db.ObjectID.createFromHexString(req.session.user._id.toString())}, function(err, user) {
    
    db.collection('usercollection').update({_id: user._id}, {$set: {type: req.body.type}}, function(err) {
      res.redirect('userinfo');
    });
  });

});


module.exports = router;
