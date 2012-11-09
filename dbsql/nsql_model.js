var model = require('./week_model.js');

const create_week_table = "CREATE TABLE IF NOT EXISTS week (id INTEGER PRIMARY KEY, week INTEGER, user_id INTEGER, \
 hours0 INTEGER, state0 INTEGER, hours1 INTEGER, state1 INTEGER, hours2 INTEGER, state2 INTEGER, hours3 INTEGER, state3 INTEGER, \
 hours4 INTEGER, state4 INTEGER, hours5 INTEGER, state5 INTEGER, hours6 INTEGER, state6 INTEGER)";
const week_user_query = "SELECT * FROM week WHERE week = ? AND user_id = ?";
const week_group_query = "SELECT * FROM week WHERE week = ? AND user_id IN \
                          (SELECT id FROM users WHERE team IN \
                           (SELECT team FROM users WHERE id = ?))";
const week_group_query_filter = "SELECT * FROM week WHERE week = ? AND user_id IN \
                                 (SELECT id FROM users WHERE team IN (%0))";
const group_query = "SELECT * FROM users WHERE team IN \
                           (SELECT team FROM users WHERE id = ?)";
const group_query_filter = "SELECT * FROM users WHERE team IN (%0) ORDER BY team";
const user_query = "SELECT * FROM users WHERE id = ?";
const week_user_update = "UPDATE week SET hours0=?, state0=?,  hours1=?, state1=?, hours2=?, state2=?, hours3=?, state3=?, \
 hours4=?, state4=?, hours5=?, state5=?, hours6=?, state6=? WHERE id= ?";
const week_user_insert = "INSERT INTO week (week, user_id, hours0, state0, hours1, state1, hours2, state2, hours3, state3, \
 hours4, state4, hours5, state5, hours6, state6) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

var db = null; //private var

function createTable(cb) {
    db.run(create_week_table, cb);
}

function merge_users(output, row) {
  //console.log('merge_users - row');
  //console.log(row);
  for (var i = 0; i < output.length; i++) {
    if(row && output[i].user == row.user_id) {
      output[i].id = row.id;
      for(var d=0; d<7; d++) {
        output[i].days[d].hours = row["hours"+d];
        output[i].days[d].state = row["state"+d];

      }
    }
  };
}

function get_row(week, user_id, cb) {
    console.log("get row "+ week +" , " + user_id);
    var output = new Array();
    db.prepare(user_query, user_id).get(function(err, rows) {
      var flag = rows['flag'];
      var filter = rows['filter'];
      console.log(filter);
      if(flag == 0){
        //we have to get only one row, for one user
        //redo:
        var m = new model.week_status(week, user_id);
        db.prepare(week_group_query, week, user_id)
          .all(function(err, rows) {
          console.log(err);
          output.push(m);
          if(rows != undefined) {
            console.log(rows);
            merge_users(output, rows[0]);
          }
          return cb(output);
        });
      } else {
        //compose list of rows
        var query = group_query_filter.replace(/%0/g, filter);
        db.prepare(query)
        .all(function(err, rows) {
          if(rows != undefined) {
            for(var i in rows) { //not good, it's better to use foreach
              var m = new model.week_status(week, rows[i].id);
              m.user_name = rows[i].name;
              output.push(m);
            }
            //get data from db and merge it with blank result array
            var query = week_group_query_filter.replace(/%0/g, filter);
            db.prepare(query, week)
            .all(function(err, wrows){
              for(var i in wrows) { //todo, too havy operation, has to be async
                merge_users(output, wrows[i]);
              }
              return cb(output);
            });
          } else {
            console.log('error get row ', err);
          }
        });
      }
    });

/*    
*/
}

function set_row(week, user_id, data, cb) {
    console.log("set row "+ week +" , " + user_id);

    var m = new model.week_status(week, user_id);
    m.days = data

    console.log(m);
    //find a record and update it
    db.prepare(week_user_query, week, user_id)
      .get(function(err, rows) {
        //parse data into array
        if(rows != undefined) {
          console.log(rows + rows.id);
          db.prepare(week_user_update, m.days[0].hours, m.days[0].state,
                                      m.days[1].hours, m.days[1].state, 
                                      m.days[2].hours, m.days[2].state, 
                                      m.days[3].hours, m.days[3].state, 
                                      m.days[4].hours, m.days[4].state, 
                                      m.days[5].hours, m.days[5].state,
                                      m.days[6].hours, m.days[6].state, rows.id)
            .run(function(err) {
              console.log("upd " + err);
              return cb(m);
            });
        } else { //new line
          db.prepare(week_user_insert, week, user_id, m.days[0].hours, m.days[0].state,
                                                      m.days[1].hours, m.days[1].state, 
                                                      m.days[2].hours, m.days[2].state, 
                                                      m.days[3].hours, m.days[3].state, 
                                                      m.days[4].hours, m.days[4].state, 
                                                      m.days[5].hours, m.days[5].state,
                                                      m.days[6].hours, m.days[6].state)
            .run(function(err) {
              console.log("insert " + err);
              return cb(m);
            });
        } 
    });
}


//interface
function nsql_model(_db, cb) {
  db = _db;
  createTable(function() {
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
