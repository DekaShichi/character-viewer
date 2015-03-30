// Copyright (c) 2015 DekaShichi

var chars;
var currentIndex = -1;
$(document).ready(function() {
    load();
    
    $("#info").hide();
});

function init(resp) {
    chars = JSON.parse(resp);    
    if(chars) {
        render_grid();
    }
}

function load() {
    var xobj = new XMLHttpRequest();
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a
            // value but simply returns undefined in asynchronous mode
            init(xobj.responseText);
          }
    };
    xobj.open('GET', 'chars.json', true);
    xobj.send();
}

function render_grid() {
    // Empty the children first (in case of using load/init again).
    $("#grid").empty();
    
    for(var i = 0; i < chars.length; i++) {
        var div = document.createElement("DIV");
        div.setAttribute("id","char" + i);
        
        var img = document.createElement("IMG");
        img.setAttribute("id","charImg" + i);
        img.setAttribute("src",chars[i].icon);
        img.setAttribute("alt",chars[i].name);
        
        div.appendChild(img);
        document.getElementById("grid").appendChild(div);
        $("#grid div").eq(i).on("click", { index: i }, function(e) {
            // Reset all of the icon borders no matter what.
            $("#grid div img").css("border","");
            if(currentIndex == e.data.index) {
                var info = $("#info");
                // Empty data once done faing out.
                info.fadeOut(function() { info.empty(); });
                currentIndex = -1;
            }
            else
            {
                var style = document.getElementById("charImg" + e.data.index)
                        .style;
                if(chars[e.data.index].hasOwnProperty('border')) {
                    style.border = "thick solid " + chars[e.data.index].border;
                }
                else {
                    style.border = "thick solid turquoise";
                }
                currentIndex = e.data.index;
                render(chars[e.data.index]);
                $("#info").fadeIn();
            }
        });
    }
}

function render(char) {
    // Empty the children first.
    $("#info").empty();
    
    var div = document.createElement("DIV");
    var divText = document.createTextNode("Name: " + char.name);
    div.appendChild(divText);
    document.getElementById("info").appendChild(div);
    
    div = document.createElement("DIV");
    var divText = document.createTextNode("Age: " + char.age);
    div.appendChild(divText);
    document.getElementById("info").appendChild(div);
}