import createModule from "../createModuleObject.js";
import createModuleSlider from "../createModuleSlider.js";
import audioContext from "../../main.js";
import Cable from "../../classes/Cable.js";

export default function createGain(event, initalGain) {
    let module = createModule("gain", true, false, false, undefined);

    module.audioNode = audioContext.createGain();
    module.audioNode.gain.value = initalGain;

    createModuleSlider(module, "gain", initalGain, 0, 10, 0.1, "", false);

    new Cable(module); // create first inital cable linked to module

    event.preventDefault();
}
