import createModule from '../structure/createModule.js';
import createModuleSlider from '../structure/createModuleSlider.js';
import audioContext from '../main.js'

export default function createGain(event, initalGain) {
    let module = createModule("gain", true, false, false, undefined);

    module.audioNode = audioContext.createGain();
    module.audioNode.gain.value = initalGain;

    createModuleSlider(module, "gain", initalGain, 0, 10, 0.1, "", false);

    event.preventDefault();
}