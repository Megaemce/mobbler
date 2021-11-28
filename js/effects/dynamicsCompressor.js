import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function dynamicsCompressor(event, initalThreshold, initalKnee, initalRatio, initalAttack, initalRelease) {
    const knee = parseFloat(initalKnee || 20.0);
    const ratio = parseFloat(initalRatio || 12.0);
    const attack = parseFloat(initalAttack || 0.003);
    const release = parseFloat(initalRelease || 0.25);
    const threshold = parseFloat(initalThreshold || -24.0);
    const kneeInfo = "Determines how abruptly or gradually compression begins once the sound level crosses the threshold";
    const ratioInfo = "The amount of gain reduction. Input level over this amount dB will be reduced by 1dB over the threshold";
    const attackInfo = "The point where the sound begins and increases in volume to its peak";
    const releaseInfo = "The rate at which the volume drops to zero as the sound stops playing";
    const thresholdInfo = "The level at which a dynamics processing unit will begin to change the gain of the incoming signal";

    const module = new Module("dynamics compressor", true, false, false, undefined);

    module.audioNode = new DynamicsCompressorNode(audioContext);

    module.createSlider("threshold", threshold, -36.0, 0.0, 0.01, "Db", false, thresholdInfo);
    module.createSlider("knee", knee, 0.0, 40.0, 0.01, "Db", false, kneeInfo);
    module.createSlider("ratio", ratio, 1.0, 20.0, 0.1, "", false, ratioInfo);
    module.createSlider("attack", attack, 0, 1.0, 0.001, "sec", false, attackInfo);
    module.createSlider("release", release, 0, 1.0, 0.05, "sec", false, releaseInfo);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
