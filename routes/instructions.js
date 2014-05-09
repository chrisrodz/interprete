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
* GET instructions view
*/
router.get('/', restrict, function(req, res) {
  res.render('instructions', {user: req.session.user});
});

module.exports = router;