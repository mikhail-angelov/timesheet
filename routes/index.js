
/*
 * GET home page.
 */

var model = require('./week_model.js');
exports.index = function(req, res){
  var a = new model.week_status(39); //temp, has to be passed from app.js
  console.log(a);
  res.render('index', { current_week: a, title: 'ts', week_number: 39});
};