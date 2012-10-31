
/**
 * Module dependencies.
 */
var fs = require('fs');
var nodemailer = require("nodemailer");
var hash = require('./pass').hash;

var mailOptions = {
    from: "mikhail.angelov@auriga.com",
    to: "",
    subject: "new timesheet password",
    text: "Your new timesheet password is: "
}

var gconfig = {};
function setup(){
 var str = fs.readFileSync(__dirname + '/config.txt', 'ascii');
 //it should be reg exp
 str = str.split('\r\n').join("");
 gconfig = JSON.parse(str);
};
setup();

// dummy database
function dummy_database(){
  nsql_users.get_id('mikhail.angelov', function(id){
    console.log(id);
    if(id === undefined) {
      //fill in our db
      var master_pass = '0' + Math.floor(Math.random()*999);
      hash(master_pass, function(err, salt, hash){ //get password
        var users = fs.readFileSync(__dirname + '/staff.txt', 'utf8');
         //it should be reg exp
        users = users.split('\r\n');
        for (var i = 0; i < users.length; i++) { //it could be all async, but I don't care
          console.log('hash ' + users[i]);
          var u = users[i].split(',');
          if(u[0] != '') {
            nsql_users.new_user(u[0],u[1],u[2],hash,salt,u[3]);
          }
        };
      });
    }
  });
}

var db = require('../dbsql/dbsql.js');
var nsql_users;
require('../dbsql/nsql_users.js').nsql_users(db.openDb(), function(m){
  console.log('user db init'); nsql_users = m; dummy_database();});


// Authenticate using our plain-object database of doom!
function authenticate(name, pass, fn) {
  console.log('auth ' + name + pass);
  if (!module.parent) console.log('authenticating %s:%s', name, pass);

  nsql_users.get_id(name, function(id){
    nsql_users.get_password(id, function(password, salt){
      hash(pass, salt, function(err, hash){
        if (err) return fn(err);
        if(hash == password) {
          fn(null, id);
        } else {
          fn(new Error('invalid password'));
        }
      });
    });
  });
}

function send_mail(name, cb) {
  console.log('send_mail '+ name);
  //https://github.com/andris9/Nodemailer

  var transport = nodemailer.createTransport("SMTP", {
    host: gconfig.smtp_server,
    port: 25,
    security: false,
    auth: {
        user: gconfig.user,
        pass: gconfig.pass
    }
  });

  //generate new password
  var pass = '0' + Math.floor(Math.random()*999);
  //store password, and send a mail
  nsql_users.get_id(name, function(id){
    if(id != undefined) {
      hash(pass, function(err, salt, hash) {
        nsql_users.set_password(id, hash, salt, function(){
          nsql_users.get_name(id, function(name, email) {
            mailOptions.to = email;
            mailOptions.text += pass;
            console.log(mailOptions);
            transport.sendMail(mailOptions, function(error, responseStatus){
              //if(!error){
                         console.log(error); // response from the server
                          console.log(responseStatus  ); // response from the server
              //}
              transport.close(); // close the connection pool
              if(cb) cb("error cod: " + error + "message: " +responseStatus);
            });
          });
        });
      });
    } else {
      if(cb) cb("No such user");
    }
  });
}

function validate_store_model(session, model) {
  console.log(session)
  return true; //todo, implement
}

function send_report(user_id, model, reciever, cb) {
  console.log('send_report');
  console.log(user_id);
  console.log(model);
  console.log(reciever);
  return cb(); //todo, implement
}

module.exports.auth = authenticate;
module.exports.send_mail = send_mail;
module.exports.validate_store_model = validate_store_model;
module.exports.send_report = send_report;