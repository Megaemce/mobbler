import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function analyser(event, initalSmoothingTimeConstant, initalMaxDecibels, initalType) {
    const canvasWidth = 180;
    const canvasHeight = 100;
    const fftSizeSineWave = 2048;
    const fftSizeFrequencyBars = 512;
    const type = initalType || "sine wave";
    const maxDecibels = initalMaxDecibels || 0;
    const smoothingTimeConstant = initalSmoothingTimeConstant || 0.25;
    const visualSettings = ["sine wave", "frequency bars"];

    let animationID;
    let module = new Module("analyser", true, false, false, visualSettings);

    module.audioNode = audioContext.createAnalyser();
    module.audioNode.maxDecibels = maxDecibels;
    module.audioNode.smoothingTimeConstant = smoothingTimeConstant;

    // start inital analyser
    module.visualizeOn(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, type);

    // on type change switch animation's style
    module.content.options.select.onchange = function () {
        window.cancelAnimationFrame(animationID);
        module.visualizeOn(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, this.value);
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
