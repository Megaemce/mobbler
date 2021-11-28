import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function analyser(event, initalSmoothing, initalMaxDecibels, initalType) {
    const type = String(initalType || "sine wave");
    const maxDecibels = parseFloat(initalMaxDecibels || 0);
    const smoothingTimeConstant = parseFloat(initalSmoothing || 0.25);
    const canvasWidth = 180;
    const canvasHeight = 100;
    const fftSizeSineWave = 2048;
    const fftSizeFrequencyBars = 512;
    const analyserTypes = ["sine wave", "frequency bars"];

    let animationID;
    const module = new Module("analyser", true, false, false, analyserTypes);

    // set audioNode with inital values
    module.audioNode = new AnalyserNode(audioContext, {
        maxDecibels: maxDecibels,
        smoothingTimeConstant: smoothingTimeConstant,
    });

    // start inital analyser
    animationID = module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, type);

    // on type change switch animation's style
    module.content.options.select.onchange = function () {
        window.cancelAnimationFrame(animationID);
        module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, this.value);
    };
}
