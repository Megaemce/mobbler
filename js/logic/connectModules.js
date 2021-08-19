// Make a connection between two modules
export default function connectModules(sourceModule, destinationModule) {
    // if the sourceModule has an audio node, connect them up.
    // AudioBufferSourceNodes may not have an audio node yet.
    if (sourceModule.audioNode && destinationModule.audioNode) sourceModule.audioNode.connect(destinationModule.audioNode);

    // execute function if there is any hooked
    if (destinationModule.onConnectInput) destinationModule.onConnectInput();

    // check if not final destination (no head) and turn diode on
    if (destinationModule.head && destinationModule.head.diode) destinationModule.head.diode.classList.add("diode-on");
}
