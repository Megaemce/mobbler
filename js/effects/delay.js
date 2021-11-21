import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function delay(event, initialDelay, initalMaxDelay) {
    const delay = initialDelay || 0.2;
    const maxDelay = initalMaxDelay || 5;
    const delayInfo = "Number of seconds by which the signal will be delayed";

    let module = new Module("delay", true, false, false, undefined);

    module.audioNode = audioContext.createDelay(maxDelay);

    module.createSlider("delay Time", delay, 0.0, maxDelay, 0.01, "sec", false, delayInfo);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
