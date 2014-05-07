var express = require('express');
var router = express.Router();

var childProcess = require('child_process');

function restrict (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/users/login');
    };
}

/*
* GET admin view
*/
router.get('/', function(req, res) {
	var db = req.db;
	db.collection('usercollection').find().toArray(function (err, items) {
    db.collection('passwords').find().toArray(function (err2, passes) {
      res.render('admin', {users: items, passwords: passes});
    });
	});
});

/*
* GET admin userinfo view
*/
router.get('/userinfo/:userid', function(req, res) {
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
router.get('/delete_user/:userid', function(req, res) {
  var db = req.db;
  db.collection('usercollection').remove({_id: db.ObjectID.createFromHexString(req.params.userid.toString())}, function(err) {
		res.redirect('/admin/');
  });
});

/*
* GET User confirmation page. He gets here through email.
*/
router.get('/addinterp', function(req, res) {
	var db = req.db;
	db.collection('interpcollection').find().toArray(function (err, items){
  		res.render('addinterp', {interps: items});
  	});
});

/*
 * POST to addinterp.
 */
router.post('/addinterp', function(req, res) {
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
router.get('/delete/:interpid', function(req, res) {
  var db = req.db;
  db.collection('interpcollection').remove({_id: db.ObjectID.createFromHexString(req.params.interpid.toString())}, function(err) {
    db.collection('interpcollection').find().toArray(function (err, items){
		res.redirect('/admin/addinterp/');
	});
  });
});

router.get('/generate-passwords', function(req, res) {
  res.render('generate_passwords')
});

router.post('/generate-passwords', function(req, res) {
  var hours = req.body.hours;
  var amount = req.body.amount;
  childProcess.exec('node ./scripts/pwdGenerator.js ' + amount + ' ' + hours, function(error, stdout, stderr) {
    console.log(error);
    console.log(stdout);
    console.log(stderr);
    res.render('generate_passwords', {addedPasswords: true});
  });
});

module.exports = router;