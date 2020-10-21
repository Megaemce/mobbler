import {
    whileMovingCableHandler,
    stopMovingCableHandler
} from "./createCable.js";
import Cable from "../classes/classCable.js";
import connectModules from "./connectModules.js";


export default function stopMovingCable(sourceModule, destinationModule) {
    let canvas = document.getElementById("svgCanvas");

    // Stop capturing mousemove and mouseup events.
    document.removeEventListener("mousemove", whileMovingCableHandler, true);
    document.removeEventListener("mouseup", stopMovingCableHandler, true);

    canvas.classList.remove("jackCursor");

    // destination was not a real output, thus erase the line
    if (!destinationModule) {
        sourceModule.activeCable.deleteCable()
        sourceModule.activeCable = null; // removing the pointer
        return
    }

    // Put an entry into the sourceModule's outputs
    if (!sourceModule.outcomingCables)
        sourceModule.outcomingCables = new Array();

    let newCable = new Cable(sourceModule, destinationModule, sourceModule.activeCable.shape)
    sourceModule.outcomingCables.push(newCable);

    newCable.drawOnCanvas()

    // this will works just like an pointer
    let cablePointer = newCable

    // Put an entry into the destinations's inputs
    if (!destinationModule.incomingCables)
        destinationModule.incomingCables = new Array();

    destinationModule.incomingCables.push(cablePointer);

    // can connect! 
    connectModules(sourceModule, destinationModule);

    // remove the pointer as shape is already on screen
    sourceModule.activeCable = null;
}