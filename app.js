
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

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

var model = require('./routes/week_model.js');
var week = currentWeek(new Date());
console.log('current week - ' + week);

app.get('/', routes.index); //todo: need refactor 
//app.get('/users', user.list);

app.post('/week/:wn', function (req, res) {
  week = req.params.wn;
  console.log(req.params.wn);  
//todo: get data from DB
  var a = new model.week_status(week);
  console.log(JSON.stringify(a));
//then post it
  res.send(JSON.stringify(a));
});

app.post('/set/:value', function (req, res) {
  console.log(req.params.value);  
//todo: set data from DB, and return in back to client
  var a = new model.week_status(week);
  var v = req.params.value.split(',',7); //todo: not a nice form to pass data
  a.users[0].days[0].hours = v[0];
  console.log(JSON.stringify(a));
//then post it
  res.send(JSON.stringify(a));
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
