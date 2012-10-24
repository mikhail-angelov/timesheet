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
  return 'color'+type;
}

const co = '<ul class ="nav nav-list"> \
           <li><a href="#" class="color0" onclick="hand(%1,%2,0); return false;">work (8 hours)</a></li> \
           <li><a href="#" class="color1" onclick="hand(%1,%2,1); return false;">sick</a></li> \
           <li><a href="#" class="color2" onclick="hand(%1,%2,2); return false;">vacation</a></li> \
           <li><a href="#" class="color3" onclick="hand(%1,%2,3); return false;">holyday</a></li> \
           <li><a href="#" class="color4" onclick="hand(%1,%2,4); return false;">overtime</a></li> \
         </ul>';


function hand(id, index, type) { 
   //console.log(id);
   model.days[index].state = type;
   model.days[index].hours = 0;
   if(type === 0) model.days[index].hours = 8;
   id.setAttribute("class","ms "+getType(type));
   id.innerHTML = model.days[index].hours;
   console.log($('#commit')[0].getAttribute('type'));
   $('#commit')[0].setAttribute('type', 'button'); //show commit button
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
  head_row.insertCell(-1).innerHTML = 
    '<div class ="span44"><button id="prev" onclick="navigate_weeks(-1)">\<</button> Week ' + model.week + ' <button id="next" onclick="navigate_weeks(1)">\></button></div>';
  //temp, has to be updated 
  for( var i = 0; i < 7; i++) head_row.insertCell(-1).innerHTML=weekdays[i] + ' ' + (today - week_day + i - 1);

//  for(var i in model.users) {
    var user = model.user;
    var data_row = table.insertRow(-1);
//    if(model.users.length == 1) {
      data_row.insertCell(-1).innerHTML = 'work hours';
//    } else {
//      data_row.insertCell(-1).innerHTML = 'user name';
//    }
    //add row
        //console.log(table);
    var cell;
    var tid;
    var type;
    var handler;
    for (var i in model.days) {
     cell = data_row.insertCell(-1);
     tid = "tid"+i;
     type = "color" + model.days[i].state;
     cell.innerHTML = "<a href='#' class='ms "+type+"' id ='"+tid+"' data-toggle='dropdown'>"+model.days[i].hours+"</a>";

     //add popdown menu
     handler = co.replace(/%1/g,tid).replace(/%2/g,i);
     console.log(cell.innerHTML);
     $("#"+tid).popover({content: handler, placement: 'bottom', trigger: 'trigger'}); //not good, byt fine
    }

    //edit field
    data_row.insertCell(-1).innerHTML ='<input id="hours_user1" class="text-inline" type="text" ></input><button onclick=save_data("hours_user1")>v</button>';
//  }
//console.log(window.jQuery("#id2"));
}
