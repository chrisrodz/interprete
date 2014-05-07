var generator = require('password-generator');
// Database
var mongo = require('mongoskin');
var mongoUri = process.env.MONGOHQ_URL  || 'mongodb://localhost:27017/interpretelocal';
var db = mongo.db(mongoUri);
db.ObjectID = mongo.ObjectID;

if (process.argv.length !== 4) {
  console.log("Usage: node pwdGenerator.js amountOfPasswords amountOfHours");
  process.exit(1);
};

var amount = process.argv[2],
    hours  = process.argv[3],
    inserted = 0,
    data = [];

for (var i = amount - 1; i >= 0; i--) {
  data.push({
    password: generator(15),
    hours: parseInt(hours),
    used: false,
    user_id: null,
    created_date: new Date()
  });
};

db.collection('passwords').insert(data, function(err, result) {
  if (err) {
    console.log("DB Error: %s", err)
  } else{
    console.log('Inserted all passwords. Check the db :)');
    process.exit();
  };
});