var express = require('express');
var router = express.Router();

var childProcess = require('child_process');

function restrict (req, res, next) {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/admin/login');
    };
}

/*
* GET admin view
*/
router.get('/', restrict, function(req, res) {
	var db = req.db;
	db.collection('usercollection').find().toArray(function (err, items) {
    db.collection('passwords').find().toArray(function (err2, passes) {
      res.render('admin', {users: items, passwords: passes});
    });
	});
});

router.get('/login', function(req, res) {
  res.render('admin_login');
});

router.post('/login', function(req, res) {
  if (req.body.email == 'christian.etpr10@gmail.com' && req.body.password == 'teamo') {
    req.session.admin = true;
    res.redirect('/admin');
  } else {
    res.render('admin_login', {msg: 'Wrong credentials. Sorry.'});
  };
});

/*
* GET admin userinfo view
*/
router.get('/userinfo/:userid', restrict, function(req, res) {
	var db = req.db;
	db.collection('usercollection').findOne({_id: db.ObjectID.createFromHexString(req.params.userid)}, function(err, user) {
		db.collection('reservations').find({user_id: db.ObjectID.createFromHexString(user._id.toString())}).toArray(function (err, reserv) {
			res.render('userreserv', {one: user, reservations: reserv});
		});
	});
});

/*
* GET user delete
*/
router.get('/delete_user/:userid', restrict, function(req, res) {
  var db = req.db;
  db.collection('usercollection').remove({_id: db.ObjectID.createFromHexString(req.params.userid.toString())}, function(err) {
		res.redirect('/admin/');
  });
});

/*
* GET User confirmation page. He gets here through email.
*/
router.get('/addinterp', restrict, function(req, res) {
	var db = req.db;
	db.collection('interpcollection').find().toArray(function (err, items){
  		res.render('addinterp', {interps: items});
  	});
});

/*
 * POST to addinterp.
 */
router.post('/addinterp', restrict, function(req, res) {
	var db = req.db;

	var newInterp = req.body;

	// Insert user into db
	db.collection('interpcollection').insert(newInterp, function(err) {
		db.collection('interpcollection').find().toArray(function (err, items){
			res.render('addinterp', {interps: items});
		});
	});
});

/*
* GET interp delete
*/
router.get('/delete/:interpid', restrict, function(req, res) {
  var db = req.db;
  db.collection('interpcollection').remove({_id: db.ObjectID.createFromHexString(req.params.interpid.toString())}, function(err) {
    db.collection('interpcollection').find().toArray(function (err, items){
		res.redirect('/admin/addinterp/');
	});
  });
});


// Routes to generate hours passwords
router.get('/generate-passwords', restrict, function(req, res) {
  res.render('generate_passwords')
});

router.post('/generate-passwords', restrict, function(req, res) {
  var hours = req.body.hours;
  var amount = req.body.amount;
  childProcess.exec('node ./scripts/pwdGenerator.js ' + amount + ' ' + hours, function(error, stdout, stderr) {
    console.log(error);
    console.log(stdout);
    console.log(stderr);
    res.render('generate_passwords', {addedPasswords: true});
  });
});

// Route to approve reservations
router.get('/approve-reservation/:reservid', restrict, function(req, res) {
  var reserve_id = req.params.reservid;
  var db = req.db;
  db.collection('reservations').update({_id: db.ObjectID.createFromHexString(reserve_id.toString())}, {$set: {approved_by_admin: true}}, function(err) {
    res.redirect('back');
  });
});

module.exports = router;
