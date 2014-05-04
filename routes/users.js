var express = require('express');
var router = express.Router();
var sendgrid  = require('sendgrid')('makobi', 'culo1124estupido');

/* GET users listing. 
router.get('/', function(req, res) {
  res.send('respond with a resource');
});*/

router.get('/userlist', function(req, res) {
    var db = req.db;
    db.collection('usercollection').find().toArray(function (err, items) {
        res.json(items);
    });
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
    db.collection('usercollection').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
        sendgrid.send({
          to:       req.body.email,
          from:     'alex.santos.sosa@gmail.com',
          subject:  'interprete',
          text:     'My first email through SendGrid.'
        }, function(err, json) {
          if (err) { return console.error(err); }
          console.log(json);
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
