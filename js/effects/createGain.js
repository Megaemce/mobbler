import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createGain(event, initalGain) {
    let module = new Module("gain", true, false, false, undefined);

    module.audioNode = audioContext.createGain();
    module.audioNode.gain.value = initalGain;

    module.createModuleSlider("gain", initalGain, 0, 10, 0.1, "", false);

    event.preventDefault();
}
