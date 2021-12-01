import Visualizer from "../classes/Visualizer.js";
import { audioContext } from "../main.js";

export default function analyser(event, initalSmoothing, initalMaxDecibels, initalType) {
    const type = String(initalType || "sine wave");
    const maxDecibels = parseFloat(initalMaxDecibels || 0);
    const smoothingTimeConstant = parseFloat(initalSmoothing || 0.25);
    const canvasWidth = 180;
    const canvasHeight = 100;
    const fftSizeSineWave = 2048;
    const fftSizeFrequencyBars = 512;
    const analyserTypes = ["sine wave", "frequency bars", "spectogram"];

    const module = new Visualizer("analyser", analyserTypes, type, canvasWidth, canvasHeight, fftSizeSineWave, fftSizeFrequencyBars, maxDecibels, smoothingTimeConstant);

    // when switching type it might be that module is not active thus reset everything and start listening again
    module.content.options.select.onchange = function () {
        if (this.value === "spectogram") module.content.controllers.canvasDiv.className = "analyser spectro";
        else module.content.controllers.canvasDiv.className = "analyser";
        module.resetAnalyser();
    };
}
