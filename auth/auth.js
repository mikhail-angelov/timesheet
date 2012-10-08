
/**
 * Module dependencies.
 */

var hash = require('./pass').hash;

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
exports.auth = function authenticate(name, pass, fn) {
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

