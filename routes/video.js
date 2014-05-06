var express = require('express');
var router = express.Router();

/************************************* vLine functions ************************************/
var jwt = require('green-jwt');
var serviceId = 'comotu';   // replace with your service ID
var apiSecret = 'KjyFqMhl2W0uGhEzZqdzamzHSzfrx1E0-AALgUBEhTU';   // replace with your API Secret

function createToken(userId) {
  var exp = new Date().getTime() + (48 * 60 * 60);     // 2 days in seconds

  return createAuthToken(serviceId, userId, exp, apiSecret);
}

function createAuthToken(serviceId, userId, expiry, apiSecret) {
  var subject = serviceId + ':' + userId;
  var payload = {'iss': serviceId, 'sub': subject, 'exp': expiry};
  var apiSecretKey = base64urlDecode(apiSecret);
  return jwt.encode(payload, apiSecretKey);
}

function base64urlDecode(str) {
  return new Buffer(base64urlUnescape(str), 'base64');
}

function base64urlUnescape(str) {
  str += Array(5 - str.length % 4).join('=');
  return str.replace(/\-/g, '+').replace(/_/g, '/');
}
/************************************* vLine functions ************************************/

function restrict (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/users/login');
    };
}

router.get('/', restrict, function(req, res) {
  var vlineAuthToken = createToken(req.session.user._id);
  var db = req.db;
  db.collection('usercollection').find().toArray(function(err, items) {
    res.render('video', {session: req.session, jwt: vlineAuthToken, users: items, serviceId: serviceId})
  });
});

module.exports = router;