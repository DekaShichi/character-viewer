// Copyright (c) 2015 DekaShichi

var chars;
// Used to keep track of the current selected character.
var currentIndex = -1;
// Used to mitigate a bug where fast toggles will render blank.
var loading = false;
$(document).ready(function() {
    load();
    
    // Hide the info box at start.
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

// Renders the face icon grid that's clickable. A click will either generate
// the information, or "destroy" it if it's already selected.
function render_grid() {
    // Empty the children first (in case of using load/init again).
    $("#grid").empty();
    
    // Loop through each of the characters.
    for(var i = 0; i < chars.length; i++) {
        // Create a <div> DOM object.
        var div = document.createElement("DIV");
        // Set id as 'char0', 'char1', etc.
        div.setAttribute("id","char" + i);
        
        // Create a <img> DOM object.
        var img = document.createElement("IMG");
        // Set id as 'charImg0', 'charImg1', etc.
        img.setAttribute("id","charImg" + i);
        // Set src to the icon link.
        img.setAttribute("src",chars[i].icon);
        // Set the alt text as character name.
        img.setAttribute("alt",chars[i].name);
        
        // Append the img tag as a child to the div container.
        div.appendChild(img);
        // Appent the div container to the #grid element.
        document.getElementById("grid").appendChild(div);
        // Sets each div under #grid's click event.
        /* .eq(i) sets the the indexed DOM, .on("cluck", event data, event)
         * attaches the click event, with the attached event metadata.
         * In this case, the character index is attached.
         */
        // Used to attach to both the icon and the info box.
        toggle = function(e) {
            // Reset all of the icon borders no matter what.
            $("#grid img").css("border","");
            // If this character is already selected.
            if(currentIndex == e.data.index) {
                // Set the index to an arbitrary 'invalid' number so that when
                // selected again it's never initially true.
                currentIndex = -1;
                // Assigned for reuse efficiency.
                var info = $("#info");
                // Empty data once done fading out only if it's not loading
                // new data, otherwise will produce a bug that will wipe out
                // the info that's being rendered elsewhere.
                info.fadeOut(function() { if(!loading) { info.empty(); } });
            }
            // Else it's not already selected.
            else
            {
                // Set the currently selected character index.
                currentIndex = e.data.index;
                // Render the info box.
                render(chars[e.data.index]);
                // Assigned for convenience & readability.
                var style = document.getElementById("charImg" + e.data.index)
                        .style;
                // If the character data has a border color.
                if(chars[e.data.index].hasOwnProperty('border')) {
                    $("#info").css("background-color",chars[e.data.index].border);
                    style.border = "thick solid " + chars[e.data.index].border;
                }
                // If not, use a default color.
                else {
                    $("#info").css("background-color","#a2482e");
                    style.border = "thick solid turquoise";
                }
                
                // Necessary as otherwise fast toggles will wipe out currently
                // rendering info.
                loading = true;
                // Animate fade in, then said loading to false once complete.
                $("#info").fadeIn(function() { loading = false; });
            }
        };
        $("#grid div").eq(i).on("click", { index: i }, function(e) {
            // Unbind any previous click events.
            $("#info").off("click");
            if(currentIndex != e.data.index) {
                $("#info").click(function() { toggle(e); });
            }
            toggle(e);
        });
    }
}

// Renders the info box of the passed in character.
function render(char) {
    // Empty the children first.
    $("#info").empty();
    
    // Creates containers for each field.
    var div = document.createElement("DIV");
    // Create the text node to the field's info.
    var divText = document.createTextNode("Name: " + char.name);
    // Append the text node to the container.
    div.appendChild(divText);
    // Append the container to the info box.
    document.getElementById("info").appendChild(div);
    
    // Rinse and repeat for each field (not sure if there's a more elegant way)
    div = document.createElement("DIV");
    var divText = document.createTextNode("Age: " + char.age);
    div.appendChild(divText);
    document.getElementById("info").appendChild(div);
}