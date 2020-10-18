import createModule from './createModule.js';
import createModuleSlider from './createModuleSlider.js';

import {
    audioContext
}
from './main.js'


export default function createBiquadFilter() {
    let filterTypes = ["lowshelf", "highshelf", "lowpass", "highpass", "bandpass", "peaking", "notch", "allpass"];
    let gainDisabled = ["lowpass", "highpass", "bandpass", "notch", "allpass"];
    let frequency = 440.0;
    let q = 1.0;
    let gain = 1.0;
    let module = createModule("biquad filter", true, true, false, false, filterTypes);
    let select = document.getElementById(`${module.id}-footer-select`)

    module.audioNode = audioContext.createBiquadFilter();
    module.audioNode.type = "lowshelf"

    createModuleSlider(module, "frequency", frequency, 0.1, 20000, 1, "Hz", true);
    createModuleSlider(module, "Q", q, 1, 100, 0.1, "", false);
    createModuleSlider(module, "gain", gain, 0.0, 10.0, 0.01, "", false);

    select.onchange = function () {
        module.audioNode.type = filterTypes[this.selectedIndex];
        if (gainDisabled.includes(module.audioNode.type)) {
            document.getElementById(`${module.id}-content-gain`).classList.add("disabled")
        } else {
            document.getElementById(`${module.id}-content-gain`).classList.remove("disabled");
        }
    };


    if (this.event)
        this.event.preventDefault();
}