import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function analyser(event, smoothingTimeConstant, maxDecibels, type) {
    const canvasWidth = 180;
    const canvasHeight = 100;
    const fftSizeSineWave = 2048;
    const fftSizeFrequencyBars = 512;
    const initalType = type || "sine wave";
    const initalMaxDecibels = maxDecibels || 0;
    const initalSmoothing = smoothingTimeConstant || 0.25;
    const analyserTypes = ["sine wave", "frequency bars"];

    let animationID;
    let module = new Module("analyser", true, false, false, analyserTypes);

    // set audioNode with inital values
    module.audioNode = audioContext.createAnalyser();
    module.audioNode.maxDecibels = initalMaxDecibels;
    module.audioNode.smoothingTimeConstant = initalSmoothing;

    // start inital analyser
    module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, initalType);

    // on type change switch animation's style
    module.content.options.select.onchange = function () {
        window.cancelAnimationFrame(animationID);
        module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, this.value);
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
