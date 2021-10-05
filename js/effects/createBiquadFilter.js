import Module from "../classes/Module.js";
import { audioContext } from "../main.js";
import { displayAlertOnElement } from "../helpers/builders.js";

export default function createBiquadFilter(event, initalFrequency, initalQ, initalGain, initalType) {
    const filters = {
        peaking: { info: "Frequencies inside the range get a boost or an attenuation. Frequencies outside it are unchanged", frequency: { info: "The middle of the frequency range getting a boost or an attenuation" }, q: { enabled: true, info: "Controls the width of the frequency band. The greater the Q value, the larger the frequency band" }, gain: { enabled: true, info: "The boost to be applied. If negative it will be an attenuation" } },
        lowshelf: { info: "Frequencies lower than the frequency get a boost or an attenuation. Frequencies over it are unchanged", frequency: { info: "The upper limit of the frequencies getting a boost or an attenuation" }, q: { enabled: false, info: "Not used for this type of filter" }, gain: { enabled: true, info: "The boost to be applied. If negative it will be an attenuation" } },
        highshelf: { info: "Frequencies higher than the frequency get a boost or an attenuation. Frequencies lower than it are unchanged", frequency: { info: "The lower limit of the frequencies getting a boost or an attenuation" }, q: { enabled: false, info: "Not used for this type of filter" }, gain: { enabled: true, info: "The boost to be applied. If negative it will be an attenuation" } },
        lowpass: { info: "Filter with 12dB/octave rolloff. Frequencies below the cutoff pass through. Frequencies above it are attenuated", frequency: { info: "The cutoff frequency" }, q: { enabled: true, info: "Indicates how peaked the frequency is around the cutoff. The greater the value is, the greater is the peak" }, gain: { enabled: false, info: "Not used for this type of filter" } },
        highpass: { info: "Filter with 12dB/octave rolloff. Frequencies below the cutoff are attenuated. Frequencies above it pass through", frequency: { info: "The cutoff frequency" }, q: { enabled: true, info: "Indicates how peaked the frequency is around the cutoff. The greater the value is, the greater is the peak" }, gain: { enabled: false, info: "Not used for this type of filter" } },
        bandpass: { info: "Frequencies outside the given range of frequencies are attenuated. Frequencies inside it pass through", frequency: { info: "The center of the range of frequencies" }, q: { enabled: true, info: "Controls the width of the frequency band. The greater the Q value, the larger the frequency band" }, gain: { enabled: false, info: "Not used for this type of filter" } },
        notch: { info: "It is the opposite of a bandpass filter: frequencies outside the give range of frequencies pass through. Frequencies inside it are attenuated", frequency: { info: "The center of the range of frequencies" }, q: { enabled: true, info: "Controls the width of the frequency band. The greater the Q value, the larger the frequency band" }, gain: { enabled: false, info: "Not used for this type of filter" } },
        allpass: { info: "It lets all frequencies through, but changes the phase-relationship between the various frequencies", frequency: { info: "The frequency with the maximal group delay, that is, the frequency where the center of the phase transition occurs" }, q: { enabled: true, info: "Controls how sharp the transition is at the medium frequency. The larger this parameter is, the sharper and larger the transition will be" }, gain: { enabled: false, info: "Not used for this type of filter" } },
    };
    const firstFrequency = initalFrequency || 440.0;
    const firstQ = initalQ || 1.0;
    const firstGain = initalGain || 1.0;
    const firstType = initalType || "peaking";

    let module = new Module("biquad filter", true, false, false, Object.keys(filters));

    module.audioNode = audioContext.createBiquadFilter();
    module.audioNode.type = firstType;

    module.createSlider("frequency", firstFrequency, 0.1, 20000, 1, "Hz", true, filters[firstType].frequency.info);
    module.createSlider("Q", firstQ, 1, 100, 0.1, "", false, filters[firstType].q.info);
    module.createSlider("gain", firstGain, -10, 10.0, 0.01, "", false, filters[firstType].gain.info);

    module.content.options.select.onchange = function () {
        // set tooltips according to selected filter
        module.content.controllers.frequency.info.label.tooltip.innerHTML = filters[this.value].frequency.info;
        module.content.controllers.Q.info.label.tooltip.innerHTML = filters[this.value].q.info;
        module.content.controllers.gain.info.label.tooltip.innerHTML = filters[this.value].gain.info;

        // display filter's info
        displayAlertOnElement(filters[this.value].info, module.div, 5);

        // disabled slider if filter does not use it
        if (filters[this.value].q.enabled) {
            module.footer.Q.classList.remove("disabled");
            module.content.controllers.Q.slider.classList.remove("not_used");
        } else {
            module.footer.Q.classList.add("disabled");
            module.content.controllers.Q.slider.classList.add("not_used");
        }
        if (filters[this.value].gain.enabled) {
            module.footer.gain.classList.remove("disabled");
            module.content.controllers.gain.slider.classList.remove("not_used");
        } else {
            module.footer.gain.classList.add("disabled");
            module.content.controllers.gain.slider.classList.add("not_used");
        }

        module.audioNode.type = this.value;
    };

    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();
}
