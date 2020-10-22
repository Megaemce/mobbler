// returns destination if it's correct
export default function whileMovingCable(event, sourceModule) {
    let destinationModule = event.toElement;
    let modInputOrParamInputID;

    document.getElementById("svgCanvas").classList.add("jackCursor");

    // Get cursor position with respect to the page.
    let x = event.clientX + window.scrollX;
    let y = event.clientY + window.scrollY;

    // Move connector visual line
    sourceModule.activeCable.shape.setAttributeNS(null, "x2", x);
    sourceModule.activeCable.shape.setAttributeNS(null, "y2", y);

    if (destinationModule.classList) { // if we don't have class, we're not a node.

        if (destinationModule.classList.contains("node")) 
            modInputOrParamInputID = "input";
        if (destinationModule.classList.contains("audio-parameter")) 
            modInputOrParamInputID = destinationModule.id
        
        // search for module or final destination
        do {
            destinationModule = destinationModule.parentNode;
        } while (destinationModule.classList && !destinationModule.classList.contains("module") && !destinationModule.classList.contains("destination"))

        // not real module/destination, probably hit the #document 
        if (!destinationModule.classList) return;

        // if we're over our originating node, do nothing.
        if (destinationModule == sourceModule) return;

        return [destinationModule, modInputOrParamInputID];
    }
    event.preventDefault();
    event.stopPropagation();
    return;
}