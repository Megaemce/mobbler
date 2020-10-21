import whileMovingCable from "./whileMovingCable.js";
import stopMovingCable from "./stopMovingCable.js";
import Cable from "../classes/classCable.js";

export let whileMovingCableHandler;
export let stopMovingCableHandler;

export function createCable(event, sourceModule) {
    if (!sourceModule) console.log("missing module!");

    let clickedNode = event.target;
    let destinationModule;

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

    sourceModule.classList.add("canConnect");

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
    whileMovingCableHandler = function (event) {
        destinationModule = whileMovingCable(event, sourceModule);
    };

    stopMovingCableHandler = function () {
        stopMovingCable(sourceModule, destinationModule);
    }

    // don't set listener as long as we have not started from real input
    sourceModule && document.addEventListener("mousemove", whileMovingCableHandler, true);
    // don't set listener as long as we are not over real output
    document.addEventListener("mouseup", stopMovingCableHandler, true);
    event.preventDefault();
    event.stopPropagation();
}