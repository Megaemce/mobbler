import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function analyser(event, initalSmoothing, initalMaxDecibels, initalType) {
    const canvasWidth = 180;
    const canvasHeight = 100;
    const fftSizeSineWave = 2048;
    const fftSizeFrequencyBars = 512;
    const type = initalType || "sine wave";
    const maxDecibels = initalMaxDecibels || 0;
    const smoothingTimeConstant = initalSmoothing || 0.25;
    const analyserTypes = ["sine wave", "frequency bars"];

    let animationID;
    let module = new Module("analyser", true, false, false, analyserTypes);

    // set audioNode with inital values
    module.audioNode = audioContext.createAnalyser();
    module.audioNode.maxDecibels = maxDecibels;
    module.audioNode.smoothingTimeConstant = smoothingTimeConstant;

    // start inital analyser
    animationID = module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, type);

    // on type change switch animation's style
    module.content.options.select.onchange = function () {
        window.cancelAnimationFrame(animationID);
        module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, this.value);
    };
}
