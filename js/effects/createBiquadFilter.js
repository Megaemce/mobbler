import createModule from '../structure/createModule.js';
import createModuleSlider from '../structure/createModuleSlider.js';
import audioContext from '../main.js'

export default function createBiquadFilter(event, initalFrequency, initalQ, initalGain, initalType) {
    const filterTypes = ["peaking", "lowshelf", "highshelf", "lowpass", "highpass", "bandpass", "notch", "allpass"];
    const gainDisabled = ["lowpass", "highpass", "bandpass", "notch", "allpass"];
    const qDisabled = ["lowshelf", "highshelf"];

    let module = createModule("biquad filter", true, false, false, filterTypes);

    module.audioNode = audioContext.createBiquadFilter();
    module.audioNode.type = initalType;

    createModuleSlider(module, "frequency", initalFrequency, 0.1, 20000, 1, "Hz", true);
    createModuleSlider(module, "Q", initalQ, 1, 100, 0.1, "", false);
    createModuleSlider(module, "gain", initalGain, 0.0, 10.0, 0.01, "", false);

    module.content.options.select.onchange = function () {
        if (gainDisabled.includes(module.audioNode.type)) {
            module.footer.gain.classList.add("disabled");
            module.content.controllers.gain.slider.classList.add("disabled")
        } else {
            module.footer.gain.classList.remove("disabled")
            module.content.controllers.gain.slider.classList.remove("disabled")
        }
        if (qDisabled.includes(module.audioNode.type)) {
            module.footer.Q.classList.add("disabled");
            module.content.controllers.Q.slider.classList.add("disabled");
        } else {
            module.footer.Q.classList.remove("disabled");
            module.content.controllers.Q.slider.classList.remove("disabled");
        }
        module.audioNode.type = this.value;
    };

    event.preventDefault();
}