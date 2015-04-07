// Copyright (c) 2015 DekaShichi

// Copyright http://stackoverflow.com/a/25359264
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

var chars;
// Used to keep track of the current selected character.
var currentIndex = -1;
var currentFullIndex = -1;
// Used to mitigate a bug where fast toggles will render blank.
var loading = false;
$(document).ready(function() {
    load();
});

function init(resp) {
    chars = JSON.parse(resp);    
    if(chars) {
        render_grid();
        var id = $.urlParam('id');
        if(id && id >= 0 && id < chars.length) {
            $("#grid div").eq(id).click();
        }
        else {
            // Hide the info box at start.
            $("#info").hide();
            $("#images").hide();
        }
    }
    else {
        // Hide the info box at start.
        $("#info").hide();
        $("#images").hide();
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
            // Necessary as otherwise fast toggles will wipe out currently
            // rendering info.
            loading = true;
            
            // Reset all of the icon borders no matter what.
            $("#grid img").css("border","");
            // Empty the icons no matter what.
            $("#images").empty();
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
                    info.fadeOut(function() { info.empty(); loading = false; });
                });

                window.history.replaceState({},"","./");
            }
            // Else it's not already selected.
            else
            {
                // Set the currently selected character index.
                currentIndex = e.data.index;
                // Empty the children first.
                $("#info").empty();
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
                
                // Animate fade in, then set loading to false once complete.
                $("#info").fadeIn(function () {
                    $("#images").fadeIn(function() { loading = false; });
                });

                window.history.replaceState({},"",'?' + $.param({id: e.data.index}));
            }
        });
    }
}

// Renders the face icon grid that's clickable. A click will either produce a
// a full image, or "destroy" it if it's already selected.
function render_images(index) {
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
            // Empty #full no matter what.
            $("#full").empty();
            
            // If this character is already selected.
            if(currentFullIndex == e.data.index) {
                // Set the index to an arbitrary 'invalid' number so that when
                // selected again it's never initially true.
                currentFullIndex = -1;                
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
 * Some text. = addProperty("Some text.")l
 */ 
function addProperty(text, label, div, body) {
    // Creates containers for each field.
    if(!div) div = document.createElement("DIV");
    // Create the text node to the field's info.
    // Append the text node to the container.
    if(label) {
        var span = document.createElement("SPAN");
        span.className = "label";
        span.appendChild(document.createTextNode(label + ": "));
        div.appendChild(span);
    }
    div.appendChild(document.createTextNode(text));
    // Append the container to the info box.
    if(!body) {
        document.getElementById("info").appendChild(div);
    }
    else {
        body.appendChild(div);
    }
    
    return div;
}

/* Similar to addProperty, but instead of a one-line string, it works with
 * multiple blocks/paragraphs. The block must containe \n's separating line breaks.
 */
function addBlock(block, label, div, body) {
    if(!div) div = document.createElement("DIV");
    if(label) {
        var span = document.createElement("SPAN");
        span.className = "label";
        span.style.display = "inline";
        span.appendChild(document.createTextNode(label + ": "));
        div.appendChild(span);
    }
    // Split into different paragraphs based on \n's in the JSON string.
    var paras = block.split("\n");
    for(var i = 0; i < paras.length; i++) {
        if(paras[i]) {
            div.appendChild(document.createTextNode(paras[i]));
        }
        div.appendChild(document.createElement("BR"));
    }
    // Add an extra break to add a blank line to avoid clutter.
    div.appendChild(document.createElement("BR"));
    if(!body) {
        document.getElementById("info").appendChild(div);
    }
    else {
        body.appendChild(div);
    }
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
            addProperty(list[i].value,list[i].name,li,listElem);
        }
    }
}