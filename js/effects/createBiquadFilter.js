import createModule from '../structure/createModule.js';
import createModuleSlider from '../structure/createModuleSlider.js';

import {
    audioContext
}
from '../main.js'


export default function createBiquadFilter(event, initalFrequency, initalQ, initalGain, initalType) {
    let filterTypes = ["lowshelf", "highshelf", "lowpass", "highpass", "bandpass", "peaking", "notch", "allpass"];
    let gainDisabled = ["lowpass", "highpass", "bandpass", "notch", "allpass"];
    let module = createModule("biquad filter", true, true, false, false, filterTypes);
    let select = document.getElementById(`${module.id}-footer-select`)

    module.audioNode = audioContext.createBiquadFilter();
    module.audioNode.type = initalType

    createModuleSlider(module, "frequency", initalFrequency, 0.1, 20000, 1, "Hz", true);
    createModuleSlider(module, "Q", initalQ, 1, 100, 0.1, "", false);
    createModuleSlider(module, "gain", initalGain, 0.0, 10.0, 0.01, "", false);

    select.onchange = function () {
        module.audioNode.type = filterTypes[this.selectedIndex];
        if (gainDisabled.includes(module.audioNode.type)) {
            document.getElementById(`${module.id}-content-gain`).classList.add("disabled")
        } else {
            document.getElementById(`${module.id}-content-gain`).classList.remove("disabled");
        }
    };

    event.preventDefault();
}