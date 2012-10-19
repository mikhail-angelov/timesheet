
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

//todo - redo it all
// dummy database

var users = {
  tj: { name: 'tj' },
  tt: { name: 'tttt' }
};

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)

hash('1', function(err, salt, hash){
  console.log('hash');
  if (err) throw err;
  // store the salt & hash in the "db"
  users.tj.salt = salt;
  users.tj.hash = hash;

  users.tt.salt = salt;
  users.tt.hash = hash;
});


// Authenticate using our plain-object database of doom!
function authenticate(name, pass, fn) {
  console.log('auth ' + name + pass);
  if (!module.parent) console.log('authenticating %s:%s', name, pass);
  var user = users[name];
  console.log(user);
  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash(pass, user.salt, function(err, hash){
    if (err) return fn(err);
    if (hash == user.hash) return fn(null, user);
    fn(new Error('invalid password'));
  })
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

module.exports.auth = authenticate;
module.exports.send_mail = send_mail;