var model = require('./week_model.js');

//implementation
var sqlite3 = require('sqlite3').verbose();

const create_week_table = "CREATE TABLE IF NOT EXISTS week (id INTEGER PRIMARY KEY, week INTEGER, user_id INTEGER, \
 hours0 INTEGER, state0 INTEGER, hours1 INTEGER, state1 INTEGER, hours2 INTEGER, state2 INTEGER, hours3 INTEGER, state3 INTEGER, \
 hours4 INTEGER, state4 INTEGER, hours5 INTEGER, state5 INTEGER, hours6 INTEGER, state6 INTEGER)";
const week_user_query = "SELECT * FROM week WHERE week = ? AND user_id = ?";
const week_user_update = "UPDATE week SET hours0=?, state0=?,  hours1=?, state1=?, hours2=?, state2=?, hours3=?, state3=?, \
 hours4=?, state4=?, hours5=?, state5=?, hours6=?, state6=? WHERE id= ?";
const week_user_insert = "INSERT INTO week (week, user_id, hours0, state0, hours1, state1, hours2, state2, hours3, state3, \
 hours4, state4, hours5, state5, hours6, state6) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

var db = null; //private var

function openDb(db_name, cb) {
    console.log("createDb week");
    if(db === null) {
      db = new sqlite3.Database(db_name); //sync request
    }
    createTable(cb);
}

function createTable(cb) {
    db.run(create_week_table, cb);
}

function get_row(week, user_id, cb) {
    console.log("get row "+ week +" , " + user_id);
    var m = new model.week_status(week, user_id);
    db.prepare(week_user_query, week, user_id)
      .get(function(err, rows) {
        if(rows != undefined) {
          console.log(rows);
          for(var d=0; d<7; d++) {
            console.log(rows["hours"+d]);
            m.days[d].hours = rows["hours"+d];
          }
        }
        cb(m);
    });
}

function set_row(week, user_id, data, cb) {
    console.log("set row "+ week +" , " + user_id);
//validate data
    var arr = data.split(',');
    var hours = new Array(7);
    console.log(arr);
    if(arr.length === 5) {
      hours[0] = 0;
      hours[1] = 0;
      for(var i = 0; i < 5; i++) {
        hours[i+2] = arr[i];
      }
    } else if(arr.length === 7) {
      for(var i = 0; i < 7; i++) {
        hours[i] = arr[i];
      }
    } else {
      //invalid
      return cb();
    }
    var m = new model.week_status(week, user_id);
    for(var i = 0; i < 7; i++) {m.days[i].hours = hours[i];}
    console.log(m);
    //find a record and update it
    db.prepare(week_user_query, week, user_id)
      .get(function(err, rows) {
        //parse data into array
        if(rows != undefined) {
          console.log(rows + rows.id);
          db.prepare(week_user_update, hours[0], 2, hours[1], 5, hours[2], 4, hours[3], 3, hours[4], 2, hours[5], 1, hours[6], 0, rows.id)
            .run(function(err) {
              console.log("upd " + err);
              return cb(m);
            });
        } else { //new line
          db.prepare(week_user_insert, week, user_id, hours[0], 2, hours[1], 5, hours[2], 4, hours[3], 3, hours[4], 2, hours[5], 1, hours[6], 0)
            .run(function(err) {
              console.log("insert " + err);
              return cb(m);
            });
        } 
    });
}


//interface
function nsql_model(path, cb) {
  openDb(path, function() {
    return cb({
      get_weekly_data: function(week, user_id, _cb){
        return get_row(week, user_id, _cb);
      },
      set_weekly_data: function(week, user_id, data, _cb){
        return set_row(week, user_id, data, _cb);
      }
    });
  });
}

module.exports.nsql_model = nsql_model;
