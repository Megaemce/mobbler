import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createDelay(event, initialDelay, maxDelay) {
    let module = new Module("delay", true, false, false, undefined);

    module.audioNode = audioContext.createDelay(maxDelay);
    module.audioNode.delayTime.value = initialDelay;

    module.createModuleSlider("delay Time", initialDelay, 0.0, maxDelay, 0.01, "sec", false);

    event.preventDefault();
}
