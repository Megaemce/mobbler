import createModule from "../createModuleObject.js";
import createModuleSlider from "../createModuleSlider.js";
import audioContext from "../../main.js";
import Cable from "../../classes/Cable.js";

export default function createDelay(event, initialDelay, maxDelay) {
    let module = createModule("delay", true, false, false, undefined);

    module.audioNode = audioContext.createDelay(maxDelay);
    module.audioNode.delayTime.value = initialDelay;

    createModuleSlider(module, "delay Time", initialDelay, 0.0, maxDelay, 0.01, "sec", false);

    new Cable(module); // create first inital cable linked to module

    event.preventDefault();
}
