import createModule from '../structure/createModule.js';
import createModuleSlider from '../structure/createModuleSlider.js';
import {
    audioContext
}
from '../main.js'

export default function createDelay(event, initialDelay, maxDelay) {
    let module = createModule("delay", true, true, false, false, null);

    module.audioNode = audioContext.createDelay(maxDelay);
    module.audioNode.delayTime.value = initialDelay;

    createModuleSlider(module, "delay Time", initialDelay, 0.0, maxDelay, 0.01, "sec", false);

    event.preventDefault();
}