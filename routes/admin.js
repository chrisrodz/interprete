var express = require('express');
var router = express.Router();

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
		res.render('admin', {users: items});
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

module.exports = router;