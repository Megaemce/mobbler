import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createDynamicsCompressor(event, initalThreshold, initalKnee, initalRatio, initalAttack, initalRelease) {
    let module = new Module("dynamics compressor", true, false, false, undefined);

    module.audioNode = audioContext.createDynamicsCompressor();

    module.createSlider("threshold", initalThreshold, -36.0, 0.0, 0.01, "Db", false);
    module.createSlider("knee", initalKnee, 0.0, 40.0, 0.01, "Db", false);
    module.createSlider("ratio", initalRatio, 1.0, 20.0, 0.1, "", false);
    module.createSlider("attack", initalAttack, 0, 1.0, 0.001, "sec", false);
    module.createSlider("release", initalRelease, 0, 1.0, 0.05, "sec", false);

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addFirstCable();

    event.preventDefault();
}
