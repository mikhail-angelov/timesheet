var nstore_model;
var model = require('../routes/week_model.js');

require('./nstore_model.js').nstore_model('db/wbd.db', function(m){
  ut3(m);
  ut1(m);
  //ut2(m);
});

function ut1(m) {
  m.set_weekly_data(39,'todo','23 8 8 8 8', function(o) {
    //console.log(JSON.stringify(o));
  });
}

function ut2(m) {
  m.get_weekly_data(39,'todo', function(o) {
    //console.log(JSON.stringify(o));
  });
}

function ut3(m) {
  //m.clear_all_data(function(){console.log('cleared')});
  }