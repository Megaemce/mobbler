import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createDynamicsCompressor(event, initalThreshold, initalKnee, initalRatio, initalAttack, initalRelease) {
    const thresholdInfo = "The level at which a dynamics processing unit will begin to change the gain of the incoming signal";
    const kneeInfo = "Determines how abruptly or gradually compression begins once the sound level crosses the threshold";
    const ratioInfo = "The amount of gain reduction. Input level over this amount dB will be reduced by 1dB over the threshold";
    const attackInfo = "The point where the sound begins and increases in volume to its peak.";
    const releaseInfo = "The rate at which the volume drops to zero as the sound stops playing";

    let module = new Module("dynamics compressor", true, false, false, undefined);

    module.audioNode = audioContext.createDynamicsCompressor();

    module.createSlider("threshold", initalThreshold, -36.0, 0.0, 0.01, "Db", false, thresholdInfo);
    module.createSlider("knee", initalKnee, 0.0, 40.0, 0.01, "Db", false, kneeInfo);
    module.createSlider("ratio", initalRatio, 1.0, 20.0, 0.1, "", false, ratioInfo);
    module.createSlider("attack", initalAttack, 0, 1.0, 0.001, "sec", false, attackInfo);
    module.createSlider("release", initalRelease, 0, 1.0, 0.05, "sec", false, releaseInfo);

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();

    event.preventDefault();
}
