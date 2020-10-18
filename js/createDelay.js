import createModule from './createModule.js';
import createModuleSlider from './createModuleSlider.js';
import {
    audioContext
} from './main.js';

export default function createDelay() {
    let delay = 0.2
    let module = createModule("delay", true, true, false, false, null);

    module.audioNode = audioContext.createDelay();

    createModuleSlider(module, "delay time", delay, 0.0, 1.0, 0.01, "sec", false);

    if (this.event)
        this.event.preventDefault();
}