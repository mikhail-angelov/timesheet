// this is ui adapter for week view presentation
// it draw model data (week_model.js) in to appropriate UI view

//jquery
/*function sbm(url) {
$.post(url, 0, function (response) {
console.log(responce);
switch (response) {
// ���� ����� ����� '404 error'
case '404 error': $('#err').html('�������� �� �������'); break;
// ���� ����� ����� 'OK'
case 'ok': $('#err').html('�� ��'); break;
// ����� ���������� ����������� ������� ������. ������ �� ��������� ��� break.
}
});
} */
//

var s;  //not good, but i do not know how make it right
var n;

function input_value(row){
  var text = $('#input'+row).val()
  $('#input'+row)[0].setAttribute('value', '');
  console.log(text);
  if(text == '') {
    for( var i = 2; i < 7; i++) hand(row, i, 0); //happy path
  } else {
    var hours = text.split(' ');
    if(hours.length == 5) {
      onsole.log(hours); //todo: handle it properly
    } else if(hours.length == 7) {
      console.log('handle 7');
    } else {
      console.log('incorrect input');
    }
  }

  $('#input'+row).val = ''; //clear text
}
function navigate_weeks(direction){
  n(direction);
}

function getType(type) {
  return 'color'+type;
}

function getCellElementID(row, col) {
  return "tid"+col+"_"+row;
}

const co = '<ul class ="nav nav-list"> \
           <li><a href="#" class="color0" onclick="hand(%0,%1,0); return false;">work (8 hours)</a></li> \
           <li><a href="#" class="color1" onclick="hand(%0,%1,1); return false;">sick</a></li> \
           <li><a href="#" class="color2" onclick="hand(%0,%1,2); return false;">vacation</a></li> \
           <li><a href="#" class="color3" onclick="hand(%0,%1,3); return false;">holyday</a></li> \
           <li><a href="#" class="color4" onclick="hand(%0,%1,4); return false;">overtime</a></li> \
         </ul>';

function commit(id) {
  console.log(JSON.stringify(model[id]));
  $.post('/set/', { data: JSON.stringify(model[id]) }, function(res) {
     console.log(res);
  });
  $('#commit'+id)[0].setAttribute('type', 'hidden');
}

function hand(row, index, type) { 
   //console.log(id);
   model[row].days[index].state = type;
   model[row].days[index].hours = 0;
   if(type === 0) model[row].days[index].hours = 8;
   var iid = ($('#'+getCellElementID(row,index)))[0];
   iid.setAttribute("class","ms "+getType(type));
   iid.innerHTML = model[row].days[index].hours;
   console.log($('#commit'+row)[0].getAttribute('type'));
   $('#commit'+row)[0].setAttribute('type', 'button'); //show commit button
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
    '<div class ="span44"><button class="btn btn-mini btn-info" id="prev" onclick="navigate_weeks(-1)">\<</button> Week ' + model[0].week + ' \
     <button class="btn btn-mini btn-info" id="next" onclick="navigate_weeks(1)">\></button></div>';
  //temp, has to be updated 
  //today - week_day + i -
  now.setDate(now.getDate() - week_day - 2);

  for( var i = 0; i < 7; i++) {
    now.setDate(now.getDate() +  1);
    head_row.insertCell(-1).innerHTML=weekdays[i] + ' ' + now.getDate();
  }
  head_row.insertCell(-1).innerHTML = ''; //line up
  
  for(var u in model) {
    var user = model[u].user;
    var data_row = table.insertRow(-1);
    if(model.length == 1) {
      data_row.insertCell(-1).innerHTML = 'work hours';
    } else {
      data_row.insertCell(-1).innerHTML = '<div class="left-text">'+model[u].user_name+'</div>';
    }
    //add row
        //console.log(table);
    var cell;
    var tid;
    var type;
    var handler;
    for (var i in model[u].days) {
     cell = data_row.insertCell(-1);
     tid = getCellElementID(u,i);
     type = "color" + model[u].days[i].state;
     cell.innerHTML = "<a href='#' class='ms "+type+"' id ='"+tid+"' data-toggle='dropdown'>"+model[u].days[i].hours+"</a>";

     //add popdown menu
     handler = co.replace(/%0/g,u).replace(/%1/g,i);
     $("#"+tid).popover({content: handler, placement: 'bottom', trigger: 'trigger'}); //not good, byt fine
    }

    //edit field
    data_row.insertCell(-1).innerHTML ='<div class="left-text"><input id="input'+u+'" class="text-inline" type="text" > </input> \
                                       <button class="btn btn-small btn-success" onclick=input_value('+u+')>v</button> \
                                       <input class="btn btn-small btn-info" id="commit'+u+'" onclick=commit('+u+') type="hidden" value="C"></input></div>';
  }
//console.log(window.jQuery("#id2"));
}
