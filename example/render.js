// Renders the info box of the passed in character.
function render(char) {
    addProperty("Name",char.name);
    addProperty("Age",char.age);
    // If 'spells' exists add property.
    if('spells' in char) {
        var desc = "";
        if(char.spells.desc) desc = char.spells.desc;
        var prop = addProperty("Spells", desc);
        prop.appendChild(addUnorderedList(char.spells.list));
    }
}