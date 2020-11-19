export default function connectParameter(sourceModule, destinationModule, parameterID) {
    let sliderName = destinationModule.id + '-content-controllers-' + parameterID.split('-').pop() + '-input';
    let slider = document.getElementById(sliderName);

    if (sourceModule.audioNode && destinationModule.audioNode)
        sourceModule.audioNode.connect(destinationModule.audioNode);

    // execute function if there is any hooked
    if (slider && slider.onConnectParameter)
        slider.onConnectParameter(sourceModule);

}