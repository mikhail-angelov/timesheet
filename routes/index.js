
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { current_week: a, title: 'ts', week_number: 39});
};