import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createAnalyser(event, initalSmoothingTimeConstant, initalMaxDecibels, initalType) {
    const visualSettings = ["sine wave", "frequency bars"];
    const canvasHeight = 140;
    const canvasWidth = 240;
    const fftSizeFrequencyBars = 512;
    const fftSizeSineWave = 2048;
    let animationID;

    let module = new Module("analyser", true, false, false, visualSettings);
    let canvas = document.createElement("canvas");

    module.content.options.select.onchange = function () {
        window.cancelAnimationFrame(animationID);
        module.visualizeOn(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, this.value);
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

    module.onConnectInput = () => {
        animationID = module.visualizeOn(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, module.content.options.select.value);
    };

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();

    event.preventDefault();
}
