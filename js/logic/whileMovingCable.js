// returns destination if it's correct
export default function whileMovingCable(event, sourceModule) {
    let destinationModule = event.toElement;

    document.getElementById("svgCanvas").classList.add("jackCursor");

    // Get cursor position with respect to the page.
    let x = event.clientX + window.scrollX;
    let y = event.clientY + window.scrollY;

    // Move connector visual line
    sourceModule.activeCable.shape.setAttributeNS(null, "x2", x);
    sourceModule.activeCable.shape.setAttributeNS(null, "y2", y);

    if (destinationModule.classList) { // if we don't have class, we're not a node.

        // search for module or final destination
        do {
            destinationModule = destinationModule.parentNode;
        } while (destinationModule.classList && !destinationModule.classList.contains("module") && !destinationModule.classList.contains("destination"))

        // not real module/destination, probably hit the #document 
        if (!destinationModule.classList) return;

        // if we're over our originating node, do nothing.
        if (destinationModule == sourceModule) return;

        destinationModule.className += " canConnect";

        return destinationModule;

    }
    event.preventDefault();
    event.stopPropagation();
    return;
}