import createModule from './createModule.js';
import createModuleSlider from './createModuleSlider.js';
import {
    audioContext
} from './main.js';

export default function createDynamicsCompressor() {
    let threshold = -24.0;
    let knee = 20.0;
    let ratio = 12.0;
    let attack = 0.003;
    let release = 0.25;
    let module = createModule("dynamics compressor", true, true, false, false, null);

    module.audioNode = audioContext.createDynamicsCompressor();

    //createModuleSlider(mod, property, initalValue, min, max, step, units, logScale)
    createModuleSlider(module, "threshold", threshold, -36.0, 0.0, 0.01, "Db", false);
    createModuleSlider(module, "knee", knee, 0.0, 40.0, 0.01, "Db", false);
    createModuleSlider(module, "ratio", ratio, 1.0, 20.0, 0.1, "", false);
    createModuleSlider(module, "attack", attack, 0, 1.0, 0.001, "sec", false);
    createModuleSlider(module, "release", release, 0, 1.0, 0.05, "sec", false);

    if (this.event)
        this.event.preventDefault();
}