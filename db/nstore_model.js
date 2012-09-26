var nstore = require('nstore');
var model = require('../routes/week_model.js');

//implementation


//interface
function nstore_model(path, cb) {
  path = path || 'db/wdb.db';
  // Open database
  var db = nstore.new(path, function () {
    if(db) {
	  return cb({
	    get_weekly_data: function(week, user, cb) {
           var m = new model.week_status(week);
           return cb(m);
        },
        set_weekly_data: function(week, user, data, cb) {
          var m = new model.week_status(week);
          var v = data;//(',',7); //todo: not a nice form to pass data
          for(var i = 0 ; i < 7; i++) m.users[0].days[i].hours = v[i];
          m.week = week;
		  m.users[0].user_id = user;
		  db.save(null, m, function (err, key) {
            if (err) { console.log('err'); throw err; }
            // You now have the generated key
			db.get(key, function (err, doc, key) {
    if (err) { console.log('err'); throw err; }
    // You now have the document
	console.log('from db');
	console.log(JSON.stringify(doc));
    });
          });
		  return cb(m);
        }
      });
    }
  });
}

module.exports.nstore_model = nstore_model;
