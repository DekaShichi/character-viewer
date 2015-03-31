// Copyright (c) 2015 DekaShichi

var chars;
// Used to keep track of the current selected character.
var currentIndex = -1;
var currentFullIndex = -1;
// Used to mitigate a bug where fast toggles will render blank.
var loading = false;
$(document).ready(function() {
    load();
    
    // Hide the info box at start.
    $("#info").hide();
    $("#images").hide();
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
        img.setAttribute("id","char" + i + "Icon");
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
        $("#grid div").eq(i).on("click", { index: i }, function(e) {
            if(loading) return;
            // Reset all of the icon borders no matter what.
            $("#grid img").css("border","");
            // Empty the full image no matter what.
            $("#full").empty();
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
                $("#images").fadeOut(function() {
                    info.fadeOut(function() { info.empty(); });
                });
            }
            // Else it's not already selected.
            else
            {
                // Set the currently selected character index.
                currentIndex = e.data.index;
                // Render the info box.
                render(chars[e.data.index]);
                render_images(e.data.index);
                // Assigned for convenience & readability.
                var style = document.getElementById("char" + e.data.index + "Icon")
                        .style;
                // If the character data has a color.
                if(chars[e.data.index].hasOwnProperty('color')) {
                    $("#info").css("background-color",chars[e.data.index].color);
                    style.border = "thick solid " + chars[e.data.index].color;
                }
                // If not, use a default color.
                else {
                    $("#info").css("background-color","#a2482e");
                    style.border = "thick solid turquoise";
                }
                
                // Necessary as otherwise fast toggles will wipe out currently
                // rendering info.
                loading = true;
                // Animate fade in, then set loading to false once complete.
                $("#info").fadeIn(function () {
                    $("#images").fadeIn(function() { loading = false; });
                });
            }
        });
    }
}

// Renders the face icon grid that's clickable. A click will either produce a
// a full image, or "destroy" it if it's already selected.
function render_images(index) {
    // Empty the children first (in case of using load/init again).
    $("#images").empty();
    var char = chars[index];
    if(!char.hasOwnProperty('images') ||
            !char.images.hasOwnProperty('length')) return;
    
    // Loop through each of the characters.
    for(var i = 0; i < char.images.length; i++) {
        // Create a <div> DOM object.
        var div = document.createElement("DIV");
        // Set id as 'char0', 'char1', etc.
        div.setAttribute("id","char" + index + "Icon" + i + "Container");
        
        // Create a <img> DOM object.
        var img = document.createElement("IMG");
        // Set id as 'char0Icon0', 'char0Icon1', etc.
        img.setAttribute("id","char" + index + "Icon" + i);
        // Set src to the icon link.
        img.setAttribute("src",char.images[i].icon);
        // Set the alt text as [name] Icon [i]
        img.setAttribute("alt",char.name + " Icon " + i);
        // If the image is labeled as mature, produce a red secondary border.
        if(char.images[i].mature) {
            img.style.outline = "thick solid #c11b17";
        }
        
        // Append the img tag as a child to the div container.
        div.appendChild(img);
        // Appent the div container to the #grid element.
        document.getElementById("images").appendChild(div);
        // Sets each div under #grid's click event.
        /* .eq(i) sets the the indexed DOM, .on("cluck", event data, event)
         * attaches the click event, with the attached event metadata.
         * In this case, the character index is attached.
         */
        $("#images div").eq(i).on("click", { index: i }, function(e) {
            if(loading) return;
            // Reset all of the icon borders no matter what.
            $("#images img").css("border","");
            
            // If this character is already selected.
            if(currentFullIndex == e.data.index) {
                // Set the index to an arbitrary 'invalid' number so that when
                // selected again it's never initially true.
                currentFullIndex = -1;
                // Empty data once done fading out only if it's not loading
                // new data, otherwise will produce a bug that will wipe out
                // the info that's being rendered elsewhere.
                $("#full").empty();
            }
            // Else it's not already selected.
            else
            {
                // Set the currently selected character index.
                currentFullIndex = e.data.index;
                render_full(char.images[e.data.index].full);
                // Assigned for convenience & readability.
                var icon = $("#char" + index + "Icon" + e.data.index);
                // If the image data has a color.
                if(char.images[e.data.index].hasOwnProperty('color')) {
                    icon.css('border',"thick solid " + char.images[e.data.index].color);
                }
                else {
                    // If the character data has a color.
                    if(char.hasOwnProperty('color')) {
                        icon.css('border',"thick solid " + char.color);
                    }
                    // If not, use a default color.
                    else {
                        icon.css('border',"thick solid turquoise");
                    }
                }
            }
        });
    }
}

function render_full(imageUrl) {
    $("#full").empty();
    
    // Creates containers for each field.
    var img = document.createElement("IMG");
    img.setAttribute("id","fullImg");
    img.setAttribute("src",imageUrl);
    // Append the container to the info box.
    document.getElementById("full").appendChild(img);
}

/* Use to add a field to the info box (e.g. Name: Robert)
 * Pass in the name/label and the text (the text is optional).
 * Example:
 * Spells: = addProperty("Spells",""); vs.
 * Spells: Some text. = addProperty("Spells","Some text.");
 */ 
function addProperty(name, string) {
    // Creates containers for each field.
    var div = document.createElement("DIV");
    // Create the text node to the field's info.
    var divText = document.createTextNode(name + ": " + string);
    // Append the text node to the container.
    div.appendChild(divText);
    // Append the container to the info box.
    document.getElementById("info").appendChild(div);
    
    return div;
}

/* Use to create an unordered list.
 * Pass in a list with each item having a 'name' and 'value'.
 * Any combination of the two are optional (no name, value; visa versa).
 * Example:
 * someProp.appendChild(addUnorderedList(list_of_items));
 */ 
function addUnorderedList(list) {
    // Creates containers for each field.
    var ul = document.createElement("UL");
    createList(ul, list);
    
    return ul;
}

/* Use to create an ordered list.
 * Pass in a list with each item having a 'name' and 'value'.
 * Any combination of the two are optional (no name, value; visa versa).
 * Example:
 * someProp.appendChild(addOrderedList(list_of_items));
 */ 
function addOrderedList(list) {
    // Creates containers for each field.
    var ol = document.createElement("OL");
    createList(ol, list);
    
    return ol;
}

// Helper methods as code re-use for ordered and unordered lists.
function createList(listElem, list) {
    if(list) {
        for(var i = 0; i < list.length; i++) {
            var li = document.createElement("LI");
            // Create the text node to the field's info.
            var name, text = "";
            if('name' in list[i]) name = list[i].name;
            if('value' in list[i]) text = list[i].value;
            var liText = document.createTextNode(name + ": " + text);
            // Append the text node to the container.
            li.appendChild(liText);
            listElem.appendChild(li);
        }
    }
}