// Renders the info box of the passed in character.
/* Override this by using the addProperty, addOrderedList, and/or
 * addUnorderedList functions. Generally you should add (appendChild())
 * a list to a returned Property (a div), or #info itself.
 */
function render(char) {
    addProperty(char.name,"Name");
    addProperty(char.age,"Age");
    // If 'spells' exists add property.
    if('spells' in char) {
        var desc = "";
        if(char.spells.desc) desc = char.spells.desc;
        var prop = addProperty(desc,"Spells");
        prop.appendChild(addUnorderedList(char.spells.list));
    }
    if('appearance' in char) {
    	addBlock(char.appearance,"Appearance");
    }
}