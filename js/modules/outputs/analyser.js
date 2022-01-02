import Visualizer from "../../classes/ModuleVisualizer.js";

export default function analyser(event, initalType, initalSmoothing, initalMaxDecibels, initalCanvasWidth, initalCanvasHeight, initalFFTSizeSine, initalFFTSizeFrequency) {
    const analyserTypes = ["sine wave", "frequency bars", "spectogram"];
    const type = initalType === undefined ? analyserTypes[0] : initalType;
    const maxDecibels = parseFloat(initalMaxDecibels || 0);
    const canvasWidth = parseFloat(initalCanvasWidth || 180);
    const canvasHeight = parseFloat(initalCanvasHeight || 100);
    const fftSizeSineWave = parseFloat(initalFFTSizeSine || 2048);
    const fftSizeFrequencyBars = parseFloat(initalFFTSizeFrequency || 512);
    const smoothingTimeConstant = parseFloat(initalSmoothing || 0.25);

    const module = new Visualizer("analyser", analyserTypes, type, canvasWidth, canvasHeight, fftSizeSineWave, fftSizeFrequencyBars, maxDecibels, smoothingTimeConstant);

    // when switching type it might be that module is not active thus reset everything and start listening again
    module.content.options.select.onchange = function () {
        if (this.value === "spectogram") module.content.controllers.canvasDiv.className = "analyser spectro";
        else module.content.controllers.canvasDiv.className = "analyser";
        module.resetAnalyser();
    };

    return module;
}
