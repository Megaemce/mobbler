import whileMovingCable from "./whileMovingCable.js";
import stopMovingCable from "./stopMovingCable.js";
import Cable from "../classes/classCable.js"; 

export function createCable(event, sourceModule) {
    if (!sourceModule) console.log("missing module!");

    let clickedNode = event.target;
    let returnedPairValue;

    // Get the position of the originating connector with respect to the page.
    let x = window.scrollX + 12;
    let y = window.scrollY + 12;
    let offset = clickedNode;

    while (offset) {
        x += offset.offsetLeft;
        y += offset.offsetTop;
        offset = offset.offsetParent;
    }

    // Save starting positions of cursor and element.
    sourceModule.cursorStartX = x;
    sourceModule.cursorStartY = y;

    // Create a connector visual line
    let svgns = "http://www.w3.org/2000/svg";

    let shape = document.createElementNS(svgns, "line");
    shape.setAttributeNS(null, "x1", x);
    shape.setAttributeNS(null, "y1", y);
    shape.setAttributeNS(null, "x2", x);
    shape.setAttributeNS(null, "y2", y);
    shape.setAttributeNS(null, "stroke", "black");
    shape.setAttributeNS(null, "stroke-width", "5");

    sourceModule.activeCable = new Cable(sourceModule, null, shape);
    sourceModule.activeCable.drawOnCanvas();

    // Capture mousemove and mouseup events on the page.
    // capturing the 
    let whileMovingCableHandler = function (event) {
        returnedPairValue = whileMovingCable(event, sourceModule);
    };

    let stopMovingCableHandler = function () {
        // Stop capturing mousemove and mouseup events.
        document.removeEventListener("mousemove", whileMovingCableHandler, true);
        document.removeEventListener("mouseup", stopMovingCableHandler, true);
        stopMovingCable(sourceModule, returnedPairValue);
    }

    // don't set listener as long as we have not started from real input
    sourceModule && document.addEventListener("mousemove", whileMovingCableHandler, true);
    document.addEventListener("mouseup", stopMovingCableHandler, true);

    event.preventDefault();
    event.stopPropagation();
}