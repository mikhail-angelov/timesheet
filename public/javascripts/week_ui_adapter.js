// this is ui adapter for week view presentation
// it draw model data (week_model.js) in to appropriate UI view

//jquery
/*function sbm(url) {
$.post(url, 0, function (response) {
console.log(responce);
switch (response) {
// Если ответ равен '404 error'
case '404 error': $('#err').html('Страница не найдена'); break;
// Если ответ равен 'OK'
case 'ok': $('#err').html('Всё ок'); break;
// Можно продолжать прописывать условия дальше. Только не забывайте про break.
}
});
} */
//

var s;  //not good, but i do not know how make it right
var n;

function save_data(text_id){
  var text = document.getElementById(text_id);
  s(text.value);
  text.value = ''; //clear text
}
function navigate_weeks(direction){
  n(direction);
}

function getType(type) {
  var color = 'work';
  switch(type) {
  case '1':
    color = 'vacation';
    break;
  case '2':
    color = 'sick';
    break;
  case '3':
    color = 'overtime';
    break;
  case '4':
    color = 'from_home';
    break;

  }
  console.log(color + type);
  return color;
}

function week_view(table, model, navigate, save) {
  s = save; //function pointer to save
  n = navigate; //func pointer to navigate

  for (var i in table.rows) table.deleteRow(-1); //delete all rows

//add header
  var header=table.createTHead();
  var now = new Date();
  var today = now.getDate();
  var week_day = now.getDay();
  var head_row = header.insertRow(0);
  const weekdays = new Array('Sat', 'Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri');
  head_row.insertCell(0).innerHTML = 
    '<div class ="span44"><button id="prev" onclick="navigate_weeks(-1)">\<</button> Week ' + model.week + ' <button id="next" onclick="navigate_weeks(1)">\></button></div>';
  //temp, has to be updated 
  for( var i = 0; i < 7; i++) head_row.insertCell(-1).innerHTML=weekdays[i] + ' ' + (today - week_day + i - 1);

//  for(var i in model.users) {
    var user = model.user_id;
    var data_row = table.insertRow(-1);
//    if(model.users.length == 1) {
      data_row.insertCell(-1).innerHTML = 'work hours';
//    } else {
//      data_row.insertCell(-1).innerHTML = 'user name';
//    }
    //add row
    for (var j in model.days) {
      //add cell
      var new_cell = data_row.insertCell(-1);
      var id = "id"+j;
      var type = "input-block-level " + getType(j);
      console.log(type);
      new_cell.innerHTML = '<a class="'+type+'" href="#"  id="'+id+'" rel="popover">'+model.days[j].hours+'</a>';
      console.log(new_cell.innerHTML);

    }
    //edit field
    data_row.insertCell(-1).innerHTML ='<input id="hours_user1" class="text-inline" type="text" ></input><button onclick=save_data("hours_user1")>v</button>';
//  }
//console.log(window.jQuery("#id2"));
console.log($("#users"));

console.log(JSON.stringify($("#id2")));
$(function(){
  $("#id2").popover({trigger: 'focus', placement: 'bottom', title: '', content: '<div ><ul class="nav nav-tabs nav-stacked"> \
<li><a class="work" onclick="alert(\'hi\');" href="#">work</a></li> \
<li><a class="vacation" onclick="alert(\'hi\');" href="#">vacation</a></li> \
<li><a class="sick" href="#">sick</a></li> \
</ul></div>'});
});

$(function(){
  $("#id1").popover({trigger: 'focus', title: '', content: "It's so simple to create a tooltop for my website!"});
});
}

 $(document).ready(function(){

});