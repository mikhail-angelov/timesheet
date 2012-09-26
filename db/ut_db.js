var nstore_model;
var model = require('../routes/week_model.js');

require('./nstore_model.js').nstore_model('db/wbd.db', function(m){
  ut1(m);
});

function ut1(m) {
  m.set_weekly_data(39,'todo','8 8 8 8 8', function(o) {
    //console.log(JSON.stringify(o));
  });
}