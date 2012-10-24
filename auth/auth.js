
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
  var users = {
    tj: { name: 'tj' },
    tt: { name: 'tttt' }
  };

  nsql_users.get_id('tj', function(id){
    console.log(id);
    if(id === undefined) {
      console.log('get h');
      hash('1', function(err, salt, hash){ //get password
        console.log('hash ' + hash);
        nsql_users.new_user('tj','mikhail.angelov@auriga.com','all',hash,salt, function(){
          console.log('tj is added');
        })
      });
    }
  });
}

var nsql_users;
require('../dbsql/nsql_users.js').nsql_users('users.sqlite3', function(m){
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

  mailOptions.to = name + '@' + gconfig.mail_domain;
  mailOptions.text += 'foobar';
  console.log(mailOptions);
  transport.sendMail(mailOptions, function(error, responseStatus){
    //if(!error){
               console.log(error); // response from the server
                console.log(responseStatus  ); // response from the server
    //}
    transport.close(); // close the connection pool
    if(cb) cb("error cod: " + error + "message: " +responseStatus);
  });  
}

function validate_store_model(session, model) {
  console.log(session)
  return true;
}

module.exports.auth = authenticate;
module.exports.send_mail = send_mail;
module.exports.validate_store_model = validate_store_model;
