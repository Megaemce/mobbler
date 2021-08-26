import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createAnalyser(event, initalSmoothingTimeConstant, initalMaxDecibels, initalType) {
    const visualSettings = ["sine wave", "frequency bars"];
    const canvasHeight = 140;
    const canvasWidth = 240;
    const fftSizeFrequencyBars = 512;
    const fftSizeSineWave = 2048;
    let drawVisual;

    let module = new Module("analyser", true, false, false, visualSettings);
    let canvas = document.createElement("canvas");

    module.content.options.select.onchange = function () {
        window.cancelAnimationFrame(drawVisual);
        module.visualizeOn(drawVisual, canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, visualSettings[this.selectedIndex]);
    };

    module.audioNode = audioContext.createAnalyser();
    module.audioNode.smoothingTimeConstant = initalSmoothingTimeConstant;
    module.audioNode.maxDecibels = initalMaxDecibels;

    module.content.drawingContext = canvas.getContext("2d");
    module.content.appendChild(canvas);
    module.content.canvas = canvas;

    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    canvas.id = `${module.id}-content-controllers-canvas`;
    canvas.className = "analyserCanvas";

    module.onConnectInput = function () {
        module.visualizeOn(drawVisual, canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, initalType);
    };

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addFirstCable();

    event.preventDefault();
}
