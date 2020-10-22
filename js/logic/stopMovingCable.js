import Cable from "../classes/classCable.js";
import connectModules from "./connectModules.js";
import connectParameter from "./connectParameter.js";

export default function stopMovingCable(sourceModule, returnedPairValue) {
    let destinationModule
    let modInputOrParamInputID
    let canvas = document.getElementById("svgCanvas");

    if (returnedPairValue) {
        destinationModule = returnedPairValue[0];
        modInputOrParamInputID = returnedPairValue[1];
    }

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
    if (modInputOrParamInputID === "input"){
        connectModules(sourceModule, destinationModule);
    } else if (!modInputOrParamInputID) {
        connectParameter(sourceModule, destinationModule, modInputOrParamInputID)
    }

    // remove the pointer as shape is already on screen
    sourceModule.activeCable = null;
}