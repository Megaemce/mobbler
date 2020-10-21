// Make a connection between two modules
export default function connectModules(sourceModule, destinationModule) {
    sourceModule.classList.add("connected");
    destinationModule.classList.add("connected");

    // if the sourceModule has an audio node, connect them up.  
    // AudioBufferSourceNodes may not have an audio node yet.
    if (sourceModule.audioNode) {
        sourceModule.audioNode.connect(destinationModule.audioNode);
    }

    if (destinationModule.onConnectInput)
        destinationModule.onConnectInput();

    // turn diode on
    destinationModule.classList.add("diode-on");
}