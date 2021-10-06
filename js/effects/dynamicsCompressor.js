import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function dynamicsCompressor(event, initalThreshold, initalKnee, initalRatio, initalAttack, initalRelease) {
    const threshold = initalThreshold || -24.0;
    const knee = initalKnee || 20.0;
    const ratio = initalRatio || 12.0;
    const attack = initalAttack || 0.003;
    const release = initalRelease || 0.25;

    const thresholdInfo = "The level at which a dynamics processing unit will begin to change the gain of the incoming signal";
    const kneeInfo = "Determines how abruptly or gradually compression begins once the sound level crosses the threshold";
    const ratioInfo = "The amount of gain reduction. Input level over this amount dB will be reduced by 1dB over the threshold";
    const attackInfo = "The point where the sound begins and increases in volume to its peak.";
    const releaseInfo = "The rate at which the volume drops to zero as the sound stops playing";

    let module = new Module("dynamics compressor", true, false, false, undefined);

    module.audioNode = audioContext.createDynamicsCompressor();

    module.createSlider("threshold", threshold, -36.0, 0.0, 0.01, "Db", false, thresholdInfo);
    module.createSlider("knee", knee, 0.0, 40.0, 0.01, "Db", false, kneeInfo);
    module.createSlider("ratio", ratio, 1.0, 20.0, 0.1, "", false, ratioInfo);
    module.createSlider("attack", attack, 0, 1.0, 0.001, "sec", false, attackInfo);
    module.createSlider("release", release, 0, 1.0, 0.05, "sec", false, releaseInfo);

    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();
}
