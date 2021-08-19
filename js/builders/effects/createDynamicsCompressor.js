import createModule from "../createModuleObject.js";
import createModuleSlider from "../createModuleSlider.js";
import audioContext from "../../main.js";
import Cable from "../../classes/Cable.js";

export default function createDynamicsCompressor(event, initalThreshold, initalKnee, initalRatio, initalAttack, initalRelease) {
    let module = createModule("dynamics compressor", true, false, false, undefined);

    module.audioNode = audioContext.createDynamicsCompressor();

    createModuleSlider(module, "threshold", initalThreshold, -36.0, 0.0, 0.01, "Db", false);
    createModuleSlider(module, "knee", initalKnee, 0.0, 40.0, 0.01, "Db", false);
    createModuleSlider(module, "ratio", initalRatio, 1.0, 20.0, 0.1, "", false);
    createModuleSlider(module, "attack", initalAttack, 0, 1.0, 0.001, "sec", false);
    createModuleSlider(module, "release", initalRelease, 0, 1.0, 0.05, "sec", false);

    new Cable(module); // create first inital cable linked to module

    event.preventDefault();
}
