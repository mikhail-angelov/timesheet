//implementation
var sqlite3 = require('sqlite3').verbose();

const db_name = "users.sqlite3";
const create_users_table = "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, team TEXT, password TEXT, salt TEXT, \
                            session TEXT, new_pass TEXT, flag INTEGER, date TEXT, ip TEXT, filter TEXT)";
const user_query = "SELECT * FROM users WHERE id = ?";
const user_name_query = "SELECT * FROM users WHERE name = ?";
const user_update_password = "UPDATE users SET password=?, salt=? WHERE id= ?";
const user_update_session = "UPDATE users SET session=? WHERE id= ?";
const user_insert = "INSERT INTO users (name, email, team, password, salt, flag) VALUES(?, ?, ?, ?, ?, ?)";

var _udb; //private var

function createTable(cb) {
    _udb.run(create_users_table, function(){
      _udb.run(create_users_table, cb)
    });
}

function get_n(user_id, cb) {
    console.log("get get_n "+ user_id);
    _udb.prepare(user_query, user_id)
      .get(function(err, rows) {
        if(rows != undefined) {
          console.log(rows);
          cb(rows['name'], rows['email']);
        } else {
          console.log("not found "+user_id);
          cb();
        }
    });
}

function get_i(name, cb) {
    console.log("get get_i "+ name);
    _udb.prepare(user_name_query, name)
      .get(function(err, rows) {
        if(rows != undefined) {
          console.log(rows);
          cb(rows['id']);
        } else {
          console.log("not found "+name);
          cb();
        }
    });
}

function get_pass(user_id, cb) {
    console.log("get get_pass "+ user_id);
    _udb.prepare(user_query, user_id)
      .get(function(err, rows) {
        if(rows != undefined) {
          console.log(rows);
          cb(rows['password'], rows['salt']);
        }
    });
}

function get_sess(user_id, cb) {
    console.log("get get_sess "+ user_id);
    _udb.prepare(user_query, user_id)
      .get(function(err, rows) {
        if(rows != undefined) {
          console.log(rows);
          cb(rows['session']);
        }
    });
}

function set_pass(user_id, new_pass, new_salt, cb) {
    console.log("set set_pass " + user_id);
//validate data

    //find a record and update it
    _udb.prepare(user_query, user_id)
      .get(function(err, rows) {
        //parse data into array
        if(rows != undefined) {
          console.log(rows + rows.id);
          _udb.prepare(user_update_password, new_pass, new_salt, rows.id)
            .run(function(err) {
              console.log("upd " + err);
              return cb();
            });
        } else { 
          //handle errors
          console.log('!!!!error did not set data ');
        } 
    });
}

function set_sess(user_id, new_sess, cb) {
    console.log("set set_sess " + user_id);

    //find a record and update it
    _udb.prepare(user_query, user_id)
      .get(function(err, rows) {
        //parse data into array
        if(rows != undefined) {
          console.log(rows + rows.id);
          _udb.prepare(user_update_session, new_sess, rows.id)
            .run(function(err) {
              console.log("upd " + err);
              return cb();
            });
        } else { 
          //handle errors
          console.log('!!!!error did not set data ');
        } 
    });
}

//sync function
function insert_new_user(name, email, team, password, salt, flag) {
  console.log("insert_new_user " + name);
  _udb.prepare(user_insert, name, email, team, password, salt, flag).run();
}

function get_rec(user_id, _cb) {
  console.log("get get_rec "+ user_id);
  _udb.prepare(user_query, user_id)
    .get(function(err, rows) {
      if(rows != undefined) {
        console.log(rows);
        _cb(rows['report_receiver']);
      }
  });
}

//interface
function nsql_users(_db, cb) {
  _udb = _db;
  createTable(function() {
    return cb({
      init_db: function(_cb){
        return initUsersDB(_cb);
      },
      get_name: function(user_id, _cb){
        return get_n(user_id, _cb);
      },
      get_id: function(name, _cb){
        return get_i(name, _cb);
      },
      get_password: function(user_id, _cb){
        return get_pass(user_id, _cb);
      },
      set_password: function(user_id, new_pass, new_salt, _cb){
        return set_pass(user_id, new_pass, new_salt, _cb);
      },
      get_session: function(user_id, _cb){
        return get_sess(user_id, _cb);
      },
      set_session: function(user_id, new_pass, new_salt, _cb){
        return set_ses(user_id, new_pass, _cb);
      },
      new_user: function(name, email, team, password, salt, flag){
        return insert_new_user(name, email, team, password, salt, flag);
      },
      get_receiver: function(id, _db){
        return get_rec(id, _db);
      }
    });
  });
}

module.exports.nsql_users = nsql_users;




