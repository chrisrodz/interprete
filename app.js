var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

// Database
var mongo = require('mongoskin');
var mongoUri = process.env.MONGOHQ_URL  || 'mongodb://localhost:27017/interpretelocal';
var db = mongo.db(mongoUri);
db.ObjectID = mongo.ObjectID;


// Sendgrid for emails
var sendgrid = require('sendgrid')(process.env.SG_USER, process.env.SG_PASSWORD);


// Routes
var routes = require('./routes/index');
var users = require('./routes/users');
var reservations = require('./routes/reservations');
var instructions = require('./routes/instructions');
var video = require('./routes/video');
var admin = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('TuWaiEs7a6or8a'));
app.use(session());
app.use(express.static(path.join(__dirname, 'public')));

// Database
app.use(function(req, res, next) {
    req.db = db;
    next();
});

// Sendgrid for emails
app.use(function(req, res, next) {
    res.sendgrid = sendgrid
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/reservations', reservations);
app.use('/instructions', instructions);
app.use('/video', video);
app.use('/admin', admin);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
