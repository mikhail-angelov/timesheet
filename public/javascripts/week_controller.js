
$(document).ready(function on_load() {

    var t = document.getElementById('users');

    week_view(t, model, 
      function(direction){
        week_number = direction > 0 ? ++week_number : --week_number;
        console.log(week_number);
        var a = new $.post("/timesheet/"+week_number, function(data){
          //todo: handle errors
          model = JSON.parse(data);
          //recursion :)
          on_load();
        });
      },
      function (text){
        console.log(text);
        var o = text.split(' ',7);
        var b = o.join(','); //todo: maybe there nicer way to pass array data
        console.log(b);
        var a = new $.post("/set/"+b, function(data){
          //todo: handle errors
          model = JSON.parse(data);
          //recursion
          on_load();
        });
      });

    $('#commit').click(function(){
        console.log(JSON.stringify(model));
        $.post('/set/', { data: JSON.stringify(model) }, function(res) {
                alert(res);
            });
        $('#commit')[0].setAttribute('type', 'hidden'); //hide button
    })
});