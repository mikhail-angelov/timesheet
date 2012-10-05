
function week_status(week, user) {
  this.week = (week === undefined) ? 0 : week;
  this.user = (user === undefined) ? 0 : user;;
  this.days = new Array(7);
  for(var i = 0; i<7; i++) this.days[i] = { 
      hours : 0,
      state : 0
    };
}

module.exports.week_status = week_status;