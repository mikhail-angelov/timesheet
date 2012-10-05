//implementation
var sqlite3 = require('sqlite3').verbose();

const db_name = "users.sqlite3";
const create_week_table = "CREATE TABLE IF NOT EXISTS week (id INTEGER PRIMARY KEY, week INTEGER, user_id INTEGER, \
 hours0 INTEGER, state0 INTEGER, hours1 INTEGER, state1 INTEGER, hours2 INTEGER, state2 INTEGER, hours3 INTEGER, state3 INTEGER, \
 hours4 INTEGER, state4 INTEGER, hours5 INTEGER, state5 INTEGER, hours6 INTEGER, state6 INTEGER)";
const create_users_table = "CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY, name TEXT, email TEXT)";
const week_user_query = "SELECT * FROM week WHERE week = ? AND user_id = ?";
const week_user_update = "UPDATE week SET hours0=?, state0=?,  hours1=?, state1=?, hours2=?, state2=?, hours3=?, state3=?, \
 hours4=?, state4=?, hours5=?, state5=?, hours6=?, state6=? WHERE id= ?";
const week_user_insert = "INSERT INTO week (week, user_id, hours0, state0, hours1, state1, hours2, state2, hours3, state3, \
 hours4, state4, hours5, state5, hours6, state6) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

var db; //private var

function openDb(cb) {
    console.log("createDb week");
    if(db == undefined) {
      db = new sqlite3.Database(db_name, function(){createTable(cb);});
    } else {
      cb();
    }
}

function createTable(cb) {
    db.run(create_week_table, function(){
      db.run(create_users_table, cb)
    });
}

function get_row(week, user_id, cb) {
    console.log("get row "+ week +" , " + user_id);
    db.prepare(week_user_query, week, user_id)
      .get(function(err, rows) {
        if(rows != undefined) {
          console.log(rows);
          var m = new model.week_status(rows.week, rows.user_id);
          for(var d=0; d<7; d++) {
            console.log(rows["hours"+d]);
            m.days[d].hours = rows["hours"+d];
          }
          cb(m);
        }
    });
}

function set_row(week, user_id, data, cb) {
    console.log("set row "+ week +" , " + user_id);
//validate data
    var arr = str.split(data,' ');
    var s = Array(7);
    console.log(arr);
    if(arr.length === 5) {
      s[0].hours = 0;
      s[1].hours = 0;
      for(var i = 0; i < 5; i++) {
        s[i+2].hours = arr[i];
      }
    } else if(arr.length === 7) {
      for(var i = 0; i < 7; i++) {
        s[i].hours = arr[i];
      }
    } else {
      //invalid
      return cb();
    }
    //find a record and update it
    db.prepare(week_user_query, week, user_id)
      .get(function(err, rows) {
        //parse data into array
        if(rows != undefined) {
          console.log(rows + rows.id);
          db.prepare(week_user_update, s[0].hours, 2, s[1].hours, 5, s[2].hours, 4, s[3].hours, 3, s[4].hours, 2, s[5].hours, 1, s[6].hours, 0, rows.id)
            .run(function(err) {
              console.log("upd " + err);
              return cb();
            });
        } else { //new line
          db.prepare(week_user_insert, week, user_id, s[0].hours, 2, s[1].hours, 5, s[2].hours, 4, s[3].hours, 3, s[4].hours, 2, s[5].hours, 1, s[6].hours, 0)
            .set(function(err) {
              console.log("insert " + err);
              return cb();
            });
        } 
    });
}


//interface
function nsql_model(path, cb) {
  openDb(function() {
    return cb({
      init_db: function(_cb){
        return initUsersDB(_cb);
      },
      get_weekly_data: function(week, user_id, _cb){
        return get_row(week, user_id, _cb);
      },
      set_weekly_data: function(week, user_id, data, _cb){
        return set_row(week, user_id, data, _cb);
      }
    });
  });
}

module.exports.nsql_users = nsql_users;

//////////////
//old code

var a={name: ['me', 'you', 'they'],
         email: ['me@', 'you@', 'they@']};

function initUsersDB(cb) {
    console.log("initUsersDB");
    var stmt = db.prepare("INSERT INTO users (name, email) VALUES(?, ?)");
    //not good, this is syncronius operation
    for (var i = 0; i < 0; i++) {
        stmt.run(a.name[i],a.email[i]);
    }

    cb();
    //stmt.finalize(function(){cb();});
}
function closeDb() {
    //console.log("closeDb");
   // db.close();
}

function runChainExample() {
    createDb();
}


