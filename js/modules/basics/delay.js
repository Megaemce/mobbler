import Module from "../../classes/Module.js";
import { audioContext } from "../../main.js";

export default function delay(event, initialDelay, initalMaxDelay) {
    const delay = parseFloat(initialDelay || 0.2);
    const maxDelay = parseFloat(initalMaxDelay || 1);
    const delayInfo = "Number of seconds by which the signal will be delayed";

    const module = new Module("delay", true, false, false, undefined);

    module.audioNode = new DelayNode(audioContext);

    module.createSlider("delay Time", delay, 0.0, maxDelay, 0.01, "sec", false, delayInfo);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
