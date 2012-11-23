
/**
 * Module dependencies.
 */
var fs = require('fs');
var nodemailer = require("nodemailer");
var hash = require('./pass').hash;

var mailOptions = {
    from: "timesheet-report@auriga.com",
    to: "",
    subject: "",
    text: "",
    html: ""
}
var transportOptions = {
  host: '',
  port: 25,
  security: false
};

var gconfig = {};
function setup(){
 var str = fs.readFileSync(__dirname + '/config.txt', 'ascii');
 //it should be reg exp
 str = str.split('\r\n').join("");
 gconfig = JSON.parse(str);
 //set transportOptions
 transportOptions.host = gconfig.smtp_server;
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


// Authenticate 
function authenticate(name, pass, fn) {
  console.log('auth ' + name + pass);
  if (!module.parent) console.log('authenticating %s:%s', name, pass);

  nsql_users.get_id(name, function(id){
    nsql_users.get_password(id, function(password, salt){
      hash(pass, salt, function(err, hash){
        if (err) return fn(err);
        if(hash == password) {
          fn(null, id, hash);
        } else {
          fn(new Error('invalid password'));
        }
      });
    });
  });
}

// Authenticate 
function authenticate_with_hash(id, hash, fn) {
  console.log('authenticate_with_hash ' + id);
  nsql_users.get_password(id, function(password, salt){
    if(hash == password) {
      fn(true);
    } else {
      fn(false);
    }
  });
}

function send_mail(name, cb) {
  console.log('send_mail '+ name);
  //https://github.com/andris9/Nodemailer

  var transport = nodemailer.createTransport("SMTP", transportOptions);

  //generate new password
  var pass = '0' + Math.floor(Math.random()*999);
  //store password, and send a mail
  nsql_users.get_id(name, function(id){
    if(id != undefined) {
      hash(pass, function(err, salt, hash) {
        nsql_users.set_password(id, hash, salt, function(){
          nsql_users.get_name(id, function(name, email) {
            mailOptions.to = email;
            mailOptions.html = '';
            mailOptions.subject = "new timesheet password";
            mailOptions.text = "Your new timesheet password is: " + pass;
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

//-------------------
const theader = '<table cellspacing="0" cols="8" border="0"><colgroup span="8" width="70"></colgroup><tbody>';
const tfooter = '</tbody></table>';
const trb = '<tr>';
const tre = '</tr>';
const tdb = '<td align="CENTER" bgcolor="%0" style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; border-left: 1px solid #ccc; border-right: 1px solid #ccc">';
const tdbu = '<td align="LEFT" style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; border-left: 1px solid #ccc; border-right: 1px solid #ccc">';
const tdbh1 = '<td align="LEFT" width="167" bgcolor="grey" style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; border-left: 1px solid #ccc; border-right: 1px solid #ccc">';
const tdbh2 = '<td align="CENTER" width="67" bgcolor="grey" style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; border-left: 1px solid #ccc; border-right: 1px solid #ccc">';
const tde = '</td>';
const rfooter = '<h3>Legend</h3><table><tbody> \
  <tr><td bgcolor="yellow" width=67></td><td>Vacation</td></tr> \
  <tr><td bgcolor="pink"></td><td>Sick</td></tr> \
  <tr><td bgcolor="blue"></td><td>Holiday</td></tr> \
  <tr><td bgcolor="red"></td><td>Overtime</td></tr> \
  <tr><td bgcolor="#8ee5ee"></td><td>Work from home</td></tr> \
  </tbody></table>';
const rheader = new Array('Sat', 'Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri');
//-------------------
function get_state_color(state) {
  var color = 'white';
  switch(state){
    case 1:
     color = 'pink';
     break;
    case 2:
     color = 'yellow';
     break;
    case 3:
     color = 'blue';
     break;
    case 4:
     color = 'red';
     break;
    case 5:
     color = '#8ee5ee';
     break;
  }
  return color;
}

//todo: it's better to make it acync
function format_report(model) {
 var html = '<h2>Timesheet report week: ' + model[0].week + '</h2>';
 html += theader+trb;
 html += tdbh1 + ' ' + tde; //empty cell
 var i=0;
 var hours_data = '';
 for (i = 0; i < rheader.length; i++) {
   html += tdbh2 + rheader[i] + tde;
 };
 html += tre;
 for (i = 0; i < model.length; i++) {
   html +=trb+tdbu+model[i].user_name+tde;
   for (var j = 0; j < model[i].days.length; j++) {
     hours_data = (model[i].days[j].hours == 0) ? '' : model[i].days[j].hours;
     hours_data = tdb+hours_data+tde;
     console.log(hours_data);
     hours_data = hours_data.replace(/%0/g,get_state_color(model[i].days[j].state));
     html += hours_data;
     hours_data = '';
   };
   html +=tre;
 };
 html += tfooter;
 html += rfooter;
 console.log(html);
 return html;
}

function send_report(user_id, model, reciever, cb) {
  console.log('send_report');
  var transport = nodemailer.createTransport("SMTP", transportOptions);
  nsql_users.get_name(user_id, function(name, email) {
    var model_object = JSON.parse(model);
    mailOptions.to = email + ','+reciever;
    mailOptions.subject = 'Weekly timesheet report: ' + model_object[0].week;
    mailOptions.html = format_report(model_object);
    mailOptions.text = 'html';
    console.log(mailOptions);
    transport.sendMail(mailOptions, function(error, responseStatus){
      //if(!error){
                 console.log(error); // response from the server
                  console.log(responseStatus  ); // response from the server
      //}
      transport.close(); // close the connection pool
      if(cb) cb();
    });
  });
}

module.exports.auth = authenticate;
module.exports.auth_with_hash = authenticate_with_hash;
module.exports.send_mail = send_mail;
module.exports.validate_store_model = validate_store_model;
module.exports.send_report = send_report;