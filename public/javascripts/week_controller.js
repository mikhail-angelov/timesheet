var sent = true; 

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

    $('#report').click(function(){
      if(sent) {
        $.post('/report/', { data: JSON.stringify(model), reciever: $('#reciever').val() }, function(res) {
                console.log(res);
                sent = true;
                //show success alert
                $('.alert-info').attr('style',"display:block;");
            });
      }
      sent = false;
    })
});