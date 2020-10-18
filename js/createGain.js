import createModule from './createModule.js';
import createModuleSlider from './createModuleSlider.js';
import {
    audioContext
} from './main.js';

export default function createGain() {
    let module = createModule("gain", true, true, false, false, null);

    module.audioNode = audioContext.createGain();
    module.audioNode.gain.value = 1.0;

    createModuleSlider(module, "gain", 1.0, 0, 10, 0.1, "", false);

    if (this.event)
        this.event.preventDefault();
}