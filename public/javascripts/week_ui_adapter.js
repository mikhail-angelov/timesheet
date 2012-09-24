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

function format_cell(cell, type) {
  var color = '#ffffff';
  switch(type) {
  case 1:
    color = '#00B0F0'; //from home
    break;
  case 2:
    color = '#7030A0'; //Holiday in Lithuania
    break;
  case 3:
    color = '#F79646'; //Sick
    break;
  case 4:
    color = 'red'; //Holiday in USA
    break;
  case 5:
    color = 'yellow'; //vacation
    break;
  }
  cell.style.backgroundColor = color;
}

function week_view(table, model, navigate, save) {
  s = save;
  n = navigate;

  for (var i in table.rows) table.deleteRow(-1); //delete all rows

//add header
  var header=table.createTHead();
  var now = new Date();
  var today = now.getDate();
  var week_day = now.getDay();
  var head_row = header.insertRow(0);
  const weekdays = new Array('Sat', 'Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri');
  head_row.insertCell(0).innerHTML = 
    '<button id="prev" onclick="navigate_weeks(-1)">\<</button> Week ' + model.week + ' <button id="next" onclick="navigate_weeks(1)">\></button>';
  //temp, has to be updated 
  for( var i = 0; i < 7; i++) head_row.insertCell(-1).innerHTML=weekdays[i] + ' ' + (today - week_day + i - 1);

  for(var i in model.users) {
    var user = model.users[i];
    var data_row = table.insertRow(-1);
    if(model.users.length == 1) {
      data_row.insertCell(-1).innerHTML = 'work hours';
    } else {
      data_row.insertCell(-1).innerHTML = 'user name';
    }
    //add row
    for (var j in user.days) {
      //add cell
      var new_cell = data_row.insertCell(-1);
      new_cell.innerHTML = user.days[j].hours;
      format_cell(new_cell, user.days[j].state);
    }
    //edit field
    data_row.insertCell(-1).innerHTML =
          '<input id="hours_user1" type="text"></input><button onclick=save_data("hours_user1")>v</button>';
  }
}

