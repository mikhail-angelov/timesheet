var sqlite3 = require('sqlite3').verbose();
const db_name = "timesheet.sqlite3";

var _udb; //private var

module.exports.openDb = function openDb() {
    console.log("createDb users");
    if(_udb === undefined) {
      _udb = new sqlite3.Database(db_name);
    } 
    return _udb;
}
