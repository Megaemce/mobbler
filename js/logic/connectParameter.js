import audioContext from '../main.js'
import {
    valueToLogPosition,
    scaleBetween
} from '../math/helper.js'

export default function connectParameter(sourceModule, destinationModule, parameterID) {
    let parameterType = document.getElementById(parameterID).type
    let slider = document.getElementById(`${destinationModule.id}-content-controllers-${parameterType}-input`);
    let value = document.getElementById(`${destinationModule.id}-content-controllers-${parameterType}-info-value`);

    if (slider && sourceModule.audioNode) {
        slider.classList.add("disabled");
        slider.audioNode = audioContext.createAnalyser();

        sourceModule.audioNode.connect(slider.audioNode);

        // slider.audioNode.fftSize default vaue is 2048
        let dataArray = new Uint8Array(slider.audioNode.fftSize);

        function connectToSlider() {
            slider.audioNode.getByteTimeDomainData(dataArray);

            // performance tweak - just get the max value of array instead of iterating
            let element = Math.max(...dataArray)
            let scaledValue = scaleBetween(element, 0, 255, slider.min, slider.max);

            slider.value = slider.scaleLog ? valueToLogPosition(scaledValue, slider.min, slider.max) : scaledValue;

            if (destinationModule.audioNode)
                destinationModule.audioNode[parameterType].value = slider.value;

            value.innerHTML = scaledValue;

            //setTimeout(() => {
            requestAnimationFrame(connectToSlider);
            //}, 1000 / 60);
        }
        connectToSlider();
    }
}