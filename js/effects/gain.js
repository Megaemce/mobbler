import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function gain(event, initalGain) {
    const gain = initalGain || 1.0;
    let module = new Module("gain", true, false, false, undefined);

    module.audioNode = audioContext.createGain();
    module.audioNode.gain.value = gain;

    module.createSlider("gain", gain, 0, 5, 0.1, "", false);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
