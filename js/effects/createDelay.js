import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createDelay(initialDelay, maxDelay) {
    const delay = initialDelay || 0.2;
    const max = maxDelay || 5;
    let module = new Module("delay", true, false, false, undefined);

    module.audioNode = audioContext.createDelay(max);
    module.audioNode.delayTime.value = delay;

    module.createSlider("delay Time", delay, 0.0, max, 0.01, "sec", false);

    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();
}
