var moment = require('moment');

// Database
var mongo = require('mongoskin');
var mongoUri = process.env.MONGOHQ_URL  || 'mongodb://localhost:27017/interpretelocal';
var db = mongo.db(mongoUri);
db.ObjectID = mongo.ObjectID;

// Sendgrid for emails
var sendgrid = require('sendgrid')(process.env.SG_USER, process.env.SG_PASSWORD);

var tomorrow = moment().add("days", 1).format("MM/DD/YYYY");

db.collection("reservations").find({reservationDate: tomorrow}).toArray(function(err, items) {
  if (err) {
    console.log(err);
    process.exit(1);
  } else{
    for (var i in items) {
      db.collection('usercollection').findOne({_id: db.ObjectID.createFromHexString(items[i].user_id.toString())}, function(err, result) {
        sendgrid.send({
          to:       result.email,
          from:     'christian.etpr10@gmail.com',
          subject:  'Interprete: Reservation Reminder',
          text:     'Hi, We want to remind you of your reservation tomorrow from ' + items[i].beginTime + ' to ' + items[i].endTime + '! See you soon!'
        });
      });
    }
  };
});

// TODO: Add setTimeout para marroniar el process exit.