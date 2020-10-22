import createModule from '../structure/createModule.js';
import createModuleSlider from '../structure/createModuleSlider.js';
import {
    audioContext
}
from '../main.js'

export default function createDynamicsCompressor(event, initalThreshold, initalKnee, initalRatio, initalAttack, initalRelease) {
    let module = createModule("dynamics compressor", true, true, false, false, null);

    module.audioNode = audioContext.createDynamicsCompressor();

    //createModuleSlider(mod, property, initalValue, min, max, step, units, logScale)
    createModuleSlider(module, "threshold", initalThreshold, -36.0, 0.0, 0.01, "Db", false);
    createModuleSlider(module, "knee", initalKnee, 0.0, 40.0, 0.01, "Db", false);
    createModuleSlider(module, "ratio", initalRatio, 1.0, 20.0, 0.1, "", false);
    createModuleSlider(module, "attack", initalAttack, 0, 1.0, 0.001, "sec", false);
    createModuleSlider(module, "release", initalRelease, 0, 1.0, 0.05, "sec", false);

    event.preventDefault();
}