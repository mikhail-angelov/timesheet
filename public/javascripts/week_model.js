function user_status(user_id) {
  this.user_id = (user_id === undefined) ? 0 : user_id;
  this.days = new Array(7);
  for(var i = 0; i<7; i++) this.days[i] = new function() { 
      this.hours = 0;
      this.state = 0;
    };
}

function week_status(week) {
  this.week = (week === undefined) ? 0 : week;
  this.users = new Array(1);
  this.users[0] = new user_status();
}
