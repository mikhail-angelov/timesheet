 var week_status; //= !{JSON.stringify(40)}; //current_week
 var week; // = !{40}; //week_number
 
function on_load (week_number, model) {
    console.log('on_load  ' + week_number);

    week_status = model;
    week = week_number;
    week_view(document.getElementById('users'), week_status, 
      function(direction){
        week = direction > 0 ? ++week : --week;
        console.log(week);
        var a = new $.post("/timesheet/"+week, function(data){
         //todo: handle errors
         week_status = JSON.parse(data);
         //recursion :)
         on_load(week, week_status);
        });
      },
      function (text){
        console.log(text);
        var o = text.split(' ',7);
        var b = o.join(','); //todo: maybe there nicer way to pass array data
        console.log(b);
        var a = new $.post("/set/"+b, function(data){
         //todo: handle errors
         week_status = JSON.parse(data);
         //recursion
         on_load(week, week_status);
        });
    });
}