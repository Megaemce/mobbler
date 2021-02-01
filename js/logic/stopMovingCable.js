import Cable from "../classes/Cable.js";
import connectModules from "./connectModules.js";
import connectParameter from "./connectParameter.js";

export default function stopMovingCable(event, sourceModule) {
    let choosenElement = event.toElement;
    let destinationModule = undefined;

    sourceModule.nodes.output.classList.remove("hidden"); // make "new" output visible

    if (choosenElement.classList && choosenElement.parentModule) {
        destinationModule = choosenElement.parentModule; // parentModule is set on input and audio parameters only
    } else if (choosenElement.classList && choosenElement.classList.contains("destination-input")) {
        destinationModule = choosenElement.parentNode; // final destination, built-in attribute
    } else {
        sourceModule.activeCable.deleteCable()
        sourceModule.activeCable = undefined; // removing the pointer
        return false // something else thus kill it with fire
    }

    // Put an entry into the sourceModule's outputs
    if (!sourceModule.outcomingCables)
        sourceModule.outcomingCables = new Array();

    let newCable = new Cable(sourceModule, destinationModule, sourceModule.activeCable.shape)
    sourceModule.outcomingCables.push(newCable);

    // this will works just like an pointer
    let cablePointer = newCable

    // Put an entry into the destinations's inputs
    if (!destinationModule.incomingCables)
        destinationModule.incomingCables = new Array();

    destinationModule.incomingCables.push(cablePointer);

    // different action for input and audio parameter
    if (choosenElement.type === "input")
        connectModules(sourceModule, destinationModule);
    else // type === audio node property name without spaces
        connectParameter(sourceModule, destinationModule, choosenElement.type)

    // remove the pointer as shape is already on screen
    sourceModule.activeCable = undefined;
}