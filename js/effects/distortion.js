import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function distortion(event, initalOversample) {
    const oversample = initalOversample || "4x";
    const oversampleValues = ["none", "2x", "4x"];
    let module = new Module("distortion", true, false, false, oversampleValues);

    function makeDistortionCurve() {
        let n_samples = 256;
        let curve = new Float32Array(n_samples);
        let amount = 20;

        for (let i = 0; i < n_samples; ++i) {
            let x = (i * 2) / n_samples - 1;
            curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
        }
        return curve;
    }

    module.audioNode = audioContext.createWaveShaper();
    module.audioNode.oversample = oversample;
    module.audioNode.curve = makeDistortionCurve();

    module.content.options.select.value = oversample;

    module.content.options.select.onchange = function () {
        module.audioNode.oversample = this.value;
    };

    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();
}
