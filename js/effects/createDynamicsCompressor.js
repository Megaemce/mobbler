import Module from "../classes/Module.js";
import audioContext from "../main.js";

export default function createDynamicsCompressor(event, initalThreshold, initalKnee, initalRatio, initalAttack, initalRelease) {
    let module = new Module("dynamics compressor", true, false, false, undefined);

    module.audioNode = audioContext.createDynamicsCompressor();

    module.createModuleSlider("threshold", initalThreshold, -36.0, 0.0, 0.01, "Db", false);
    module.createModuleSlider("knee", initalKnee, 0.0, 40.0, 0.01, "Db", false);
    module.createModuleSlider("ratio", initalRatio, 1.0, 20.0, 0.1, "", false);
    module.createModuleSlider("attack", initalAttack, 0, 1.0, 0.001, "sec", false);
    module.createModuleSlider("release", initalRelease, 0, 1.0, 0.05, "sec", false);
    module.addFirstCable();

    event.preventDefault();
}
