import createModule from '../structure/createModule.js';
import createModuleSlider from '../structure/createModuleSlider.js';
import {
    audioContext
} from '../main.js';

export default function createDelay(event, initialDelay) {
    let module = createModule("delay", true, true, false, false, null);

    module.audioNode = audioContext.createDelay();

    createModuleSlider(module, "delay time", initialDelay, 0.0, 1.0, 0.01, "sec", false);

    event.preventDefault();
}