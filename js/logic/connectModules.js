// Make a connection between two modules
export default function connectModules(sourceModule, destinationModule) {
    let diode = document.getElementById(`${destinationModule.id}-head-diode`);

    // if the sourceModule has an audio node, connect them up.  
    // AudioBufferSourceNodes may not have an audio node yet.
    if (sourceModule.audioNode && destinationModule.audioNode)
        sourceModule.audioNode.connect(destinationModule.audioNode);

    // execute function if there is any hooked
    if (destinationModule.onConnectInput)
        destinationModule.onConnectInput();

    // turn diode on
    diode && diode.classList.add("diode-on");

}