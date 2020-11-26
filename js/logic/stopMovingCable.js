import Cable from "../classes/Cable.js";
import connectModules from "./connectModules.js";
import connectParameter from "./connectParameter.js";

export default function stopMovingCable(event, sourceModule) {
    let destinationModule = event.toElement
    let modInputOrParamType = undefined;

    if (destinationModule.classList) { // if we don't have class, we're not a node.
        if (destinationModule.classList.contains("module-input") || destinationModule.classList.contains("destination-input"))
            modInputOrParamType = "input";
        if (destinationModule.classList.contains("audio-parameter"))
            modInputOrParamType = destinationModule.type

        // search for module or final destination
        do {
            destinationModule = destinationModule.parentNode;
        } while (destinationModule.classList && !destinationModule.classList.contains("module") && !destinationModule.classList.contains("destination"))

        // not real module/destination, probably hit the #document or  we're over our originating node
        if (!destinationModule.classList || (destinationModule == sourceModule)) {
            sourceModule.activeCable.deleteCable()
            sourceModule.activeCable = undefined; // removing the pointer
            return
        }
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

    // different action for input and audio parameter
    if (modInputOrParamType === "input")
        connectModules(sourceModule, destinationModule);
    else if (modInputOrParamType)
        connectParameter(sourceModule, destinationModule, modInputOrParamType)

    // remove the pointer as shape is already on screen
    sourceModule.activeCable = undefined;
}