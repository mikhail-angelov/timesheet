var nsql_model = require('./nsql_model.js');
const db_name = "week.sqlite3";

nsql_model.nsql_model(db_name, function(m){
  //ut3(m, function(){ut2(m);});
  
  ut1(m);
});

function ut1(m) {
  m.set_weekly_data(40, 0,'23,8,8,8,8', function() {
    //console.log(JSON.stringify(o));
  });
}

function ut2(m) {
  m.get_weekly_data(39,0,function(model){console.log(model);});
  console.log('close ut2');
}

function ut3(m, cb) {
  console.log('u3');
  }