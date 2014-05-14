var express = require('express');
var router = express.Router();

function restrict (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/users/login');
    };
}

/* GET home page. */
router.get('/', restrict, function(req, res) {
  res.redirect('/instructions');
});

module.exports = router;
