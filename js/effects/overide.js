import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function overide(event, initalOversample, initalGain) {
    const gain = initalGain || 2;
    const gainInfo = "Multiplication of sound volume";
    const oversample = initalOversample || "none";
    const oversampleValues = ["none", "2x", "4x"];

    let module = new Module("overide", true, false, false, oversampleValues, true);

    module.audioNode = {
        inputNode: audioContext.createGain(),
        shaperNode: audioContext.createWaveShaper(),
        get gain() {
            return this.inputNode.gain;
        },
        set gain(value) {
            this.inputNode.gain.value = value;
        },
    };

    module.createSlider("gain", gain, 1, 20, 0.1, "", false, gainInfo);

    module.audioNode.shaperNode.oversample = oversample;
    module.audioNode.shaperNode.curve = new Float32Array([-1, 1]);

    module.content.options.select.value = oversample;

    module.content.options.select.onchange = function () {
        module.audioNode.shaperNode.oversample = this.value;
    };

    module.audioNode.outputNode = module.audioNode.inputNode;

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
