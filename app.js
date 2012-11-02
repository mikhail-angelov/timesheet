
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , auth = require('./auth/auth')
  , db = require('./dbsql/dbsql')
  ;

var MemoryStore = require('connect/lib/middleware/session/memory');
    
var app = express();
var nsql_model;
require('./dbsql/nsql_model.js').nsql_model(db.openDb(), function(m){
  console.log('db init'); nsql_model = m;});


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  //session
  app.use(express.cookieParser('secret level 0'));
  app.use(express.session());
  //app.use(express.cookieSession());
  //session
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Session-persisted message middleware
/*not sure
app.use(function(req, res, next){
  var err = req.session.error
    , msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});
*/
//////start code
function currentWeek(d) {
    var onejan = new Date(d.getFullYear(),0,1);
    return Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
} 

var week = currentWeek(new Date());
console.log('current week - ' + week);

app.post('/timesheet/:wn', function (req, res) {
  console.log(nsql_model);
  week = req.params.wn;
  nsql_model.get_weekly_data(week, req.session.user, function(a) {
    res.send(JSON.stringify(a));
  });
});

app.post('/set/', function (req, res) {
  if (req.session.user) {
    console.log(req.body);
    var store_model = JSON.parse(req.body.data);
    console.log(store_model);
    if(auth.validate_store_model(req.session, store_model)) {
      nsql_model.set_weekly_data(store_model.week, store_model.user, store_model.days, function(a) {
        res.send('ok');
      });
    } else {
      res.send('ok'); //todo: send an error
    }
  } else { //lost session information
    res.redirect('/login');
  }
});

function check_session(req, cb) {
  if(req.session.user === undefined) {
    if(req.cookies.timesheet_id && req.cookies.timesheet_id!='') {
      console.log('req.cookies.timesheet_id ' + req.cookies.timesheet_id);
      req.session.regenerate(function(){
        req.session.user = req.cookies.timesheet_id;
        req.session.user_name = req.cookies.timesheet_user;
        return cb(true);
      });
      console.log(req.session);
    }else{
      return cb(false);
    }
  } else {
    return cb(true);  
  }
}

function restrict(req, res, next) {
  check_session(req, function(loggedin) {
    if (loggedin) {
      console.log("restrict" +req.session.user);
      next();
    } else {
      req.session.error = 'Access denied!';
      res.redirect('/login');
    }
  });
}

app.get('/', function(req, res){
  res.redirect('login');
});

app.get('/timesheet', restrict, function(req, res){
  console.log("get " + req.session.user);
  nsql_model.get_weekly_data(week, req.session.user, function(a) {
    console.log('render ts');
    console.log(req.session);
    res.render('index',{model : a, current_week : week, user_name: req.session.user_name});
  });
});

app.get('/logout', function(req, res){
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.cookie('timesheet_id', '', {maxAge: 1, httpOnly: true});
    res.cookie('timesheet_user', '', {maxAge: 1, httpOnly: true});
    res.cookie('timesheet_token', '', {maxAge: 1, httpOnly: true});
    res.redirect('/');
  });
});

app.get('/login', function(req, res){
  check_session(req, function(loggedin) {
    if (loggedin) {
      res.redirect('timesheet');
    } else {
      res.render('login');
    }
  });
});

app.post('/login', function(req, res){
  console.log('login post ' );
  console.log(req.cookies);
  console.log(req.headers);
  console.log('------------------------------------------');

  if(req.body.command && req.body.command === 'login') {
    auth.auth(req.body.username.toLowerCase(), req.body.password, function(err, user){
      if (user) {
        // Regenerate session when signing in
        // to prevent fixation 
        req.session.regenerate(function(){
          // Store the user's primary key 
          // in the session store to be retrieved,
          // or in this case the entire user object
          req.session.user = user;
          req.session.user_name = req.body.username;
          console.log(req.session);
          //save cookies
          if(req.body.remember != undefined){
           res.cookie('timesheet_id', user, {maxAge: 900000, httpOnly: true});
           res.cookie('timesheet_user', req.body.username, {maxAge: 900000, httpOnly: true});
           res.cookie('timesheet_token', 'token', {maxAge: 900000, httpOnly: true}); //todo add hash here
          }
          res.redirect('back');
        });
      } else {
        req.session.error = 'Authentication failed, please check your '
          + ' username and password.';
        res.redirect('login');
      }
    });
  } 
});

app.post('/reset/', function(req, res){
  if (req.body.user) {
    console.log('post a mail to ' + req.body.user);
    auth.send_mail(req.body.user.toLowerCase(), function(msg){
       res.send('ok');
    });
  }
});

app.post('/report/', function(req, res){
  console.log('report ');
  console.log(req.body);
  auth.send_report(req.session.user, req.body.data, req.body.reciever, function(msg){
     res.send('ok');
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
