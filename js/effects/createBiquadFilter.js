import createModule from '../structure/createModule.js';
import createModuleSlider from '../structure/createModuleSlider.js';
import {
    audioContext
}
from '../main.js'

export default function createBiquadFilter(event, initalFrequency, initalQ, initalGain, initalType) {
    let filterTypes = ["peaking", "lowshelf", "highshelf", "lowpass", "highpass", "bandpass", "notch", "allpass"];
    let gainDisabled = ["lowpass", "highpass", "bandpass", "notch", "allpass"];
    let qDisabled = ["lowshelf", "highshelf", ]
    let module = createModule("biquad filter", true, true, false, false, filterTypes);
    let select = document.getElementById(`${module.id}-content-options-select`)

    module.audioNode = audioContext.createBiquadFilter();
    module.audioNode.type = initalType

    createModuleSlider(module, "frequency", initalFrequency, 0.1, 20000, 1, "Hz", true);
    createModuleSlider(module, "Q", initalQ, 1, 100, 0.1, "", false);
    createModuleSlider(module, "gain", initalGain, 0.0, 10.0, 0.01, "", false);

    select.onchange = function () {
        module.audioNode.type = this.value;
        if (gainDisabled.includes(module.audioNode.type)) {
            document.getElementById(`${module.id}-footer-parameter-gain`).classList.add("disabled")
            document.getElementById(`${module.id}-content-controllers-gain-input`).classList.add("disabled")
        } else {
            document.getElementById(`${module.id}-footer-parameter-gain`).classList.remove("disabled")
            document.getElementById(`${module.id}-content-controllers-gain-input`).classList.remove("disabled")
        }
        if (qDisabled.includes(module.audioNode.type)) {
            document.getElementById(`${module.id}-footer-parameter-Q`).classList.add("disabled")
            document.getElementById(`${module.id}-content-controllers-Q-input`).classList.add("disabled")
        } else {
            document.getElementById(`${module.id}-footer-parameter-Q`).classList.remove("disabled")
            document.getElementById(`${module.id}-content-controllers-Q-input`).classList.remove("disabled")
        }
    };

    event.preventDefault();
}