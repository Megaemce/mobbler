export default function connectParameter(sourceModule, destinationModule, parameterID) {
    if (sourceModule.audioNode && destinationModule.audioNode)
        sourceModule.audioNode.connect(destinationModule.audioNode);

    // execute function if there is any hooked
    if (destinationModule.onConnectInput)
        destinationModule.onConnectInput();

}