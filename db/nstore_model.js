var nstore = require('nstore');
nstore = nstore.extend(require('nstore/query')());
var model = require('../routes/week_model.js');

//implementation
function find_items(db, filter, cb) {
  var stream = db.find(filter);
  console.log('s ' +stream);
  var results = [];
  stream.on("document", function (doc, key) {
    result.push({'key':key, 'data':doc});
  });
  stream.on("end", function () {
    cb(results);
  });
};

//interface
function nstore_model(path, cb) {
  path = path || 'db/wdb.db';
  // Open database
  var db = nstore.new(path, function () {
    if(db) {
	  return cb({
	    get_weekly_data: function(week, user, cb) {
           var filter = {'week': week, 'user' : user};
		   console.log('filter ' + JSON.stringify(filter));
		   db.find(filter, function (err, results) {
		     var keys =  Object.keys(results); //array of keys
			 if(keys.length > 0) {
			   console.log('doc ' + JSON.stringify(results[keys[0]]));
			   return cb(results[keys[0]]);
			 }
           });
        },
        set_weekly_data: function(week, user, data, cb) {
           var filter = {'week': week, 'user' : user};
           console.log('filter ' + JSON.stringify(filter));
 		   db.find(filter, function (err, results) {
		     console.log('results ' + JSON.stringify(results));
             var key = null;
			 if( results != undefined) {
               var keys =  Object.keys(results); //array of keys
			   console.log('err ' + JSON.stringify(err));
			   console.log('key ' + JSON.stringify(Object.keys(results)) + keys.length);
               if(keys.length > 0) {
			     key = keys[0];
               }
             }
			 var m = new model.week_status(week, user);
             for(var i = 0 ; i < 7; i++) m.days[i].hours = data[i];
			 if(key) {
			   //remove it
			   db.remove(key, function (err) {
                 if (err) { throw err; }
                 db.save(key, m, function (err, key) {
			       console.log('err');
			       return cb(m);
			     });
               });
			 }
             else {
               db.save(null, m, function (err, key) {
	             console.log('err');
			     return cb(m);
			   });
			 }
           });
        }
      });
    }
  });
}

module.exports.nstore_model = nstore_model;
