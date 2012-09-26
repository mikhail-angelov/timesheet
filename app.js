
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  ;

var app = express();
var nstore_model;
require('./db/nstore_model.js').nstore_model('db/wbd.db', function(m){nstore_model = m;});


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//////start code
function currentWeek(d) {
    var onejan = new Date(d.getFullYear(),0,1);
    return Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
} 


var week = currentWeek(new Date());
console.log('current week - ' + week);

app.get('/', routes.index); //todo: need refactor 
//app.get('/users', user.list);

app.post('/week/:wn', function (req, res) {
  console.log(nstore_model);
  week = req.params.wn;
  nstore_model.get_weekly_data(week,'todo', function(a) {
    res.send(JSON.stringify(a));
  });
});

app.post('/set/:value', function (req, res) {
  console.log(nstore_model);
  console.log(req.params.value);  
  nstore_model.set_weekly_data(week,'todo',req.params.value, function(a) {
    res.send(JSON.stringify(a));
  });
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
