import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createBiquadFilter(event, initalFrequency, initalQ, initalGain, initalType) {
    const filterTypes = ["peaking", "lowshelf", "highshelf", "lowpass", "highpass", "bandpass", "notch", "allpass"];
    const gainDisabled = ["lowpass", "highpass", "bandpass", "notch", "allpass"];
    const qDisabled = ["lowshelf", "highshelf"];
    const qInfo = "Defining the bandwidth of frequencies that will be affected by an equalizer. The lower the Q, the broader the bandwidth curve of frequencies that will be boosted or cut.";
    const gainInfo = "The amount of increase in audio signal strength";
    const frequencyInfo = "Filter signals with frequencies above/below the specified cutoff frequency.";
    const frequency = initalFrequency || 440.0;
    const q = initalQ || 1.0;
    const gain = initalGain || 1.0;
    const type = initalType || "peaking";

    let module = new Module("biquad filter", true, false, false, filterTypes);

    module.audioNode = audioContext.createBiquadFilter();
    module.audioNode.type = type;

    module.createSlider("frequency", frequency, 0.1, 20000, 1, "Hz", true, frequencyInfo);
    module.createSlider("Q", q, 1, 100, 0.1, "", false, qInfo);
    module.createSlider("gain", gain, 0.0, 10.0, 0.01, "", false, gainInfo);

    module.content.options.select.onchange = function () {
        if (gainDisabled.includes(module.audioNode.type)) {
            module.footer.gain.classList.add("disabled");
            module.content.controllers.gain.slider.classList.add("disabled");
        } else {
            module.footer.gain.classList.remove("disabled");
            module.content.controllers.gain.slider.classList.remove("disabled");
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

    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();
}
