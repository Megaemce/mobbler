import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createGain(event, initalGain) {
    let module = new Module("gain", true, false, false, undefined);

    module.audioNode = audioContext.createGain();
    module.audioNode.gain.value = initalGain;

    module.createSlider("gain", initalGain, 0, 10, 0.1, "", false);

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();

    event.preventDefault();
}
