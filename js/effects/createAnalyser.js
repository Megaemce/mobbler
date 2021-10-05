import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createAnalyser(event, initalSmoothingTimeConstant, initalMaxDecibels, initalType) {
    const visualSettings = ["sine wave", "frequency bars"];
    const canvasHeight = 101;
    const canvasWidth = 180;
    const fftSizeFrequencyBars = 512;
    const fftSizeSineWave = 2048;
    const smoothingTimeConstant = initalSmoothingTimeConstant || 0.25;
    const maxDecibels = initalMaxDecibels || 0;
    const type = initalType || "sine wave";
    let animationID;

    let module = new Module("analyser", true, false, false, visualSettings);
    let canvas = document.createElement("canvas");

    module.content.options.select.onchange = function () {
        window.cancelAnimationFrame(animationID);
        module.visualizeOn(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, this.value);
    };

    module.audioNode = audioContext.createAnalyser();
    module.audioNode.smoothingTimeConstant = smoothingTimeConstant;
    module.audioNode.maxDecibels = maxDecibels;

    module.content.controllers.drawingContext = canvas.getContext("2d");
    module.content.controllers.appendChild(canvas);
    module.content.controllers.canvas = canvas;
    module.content.controllers.classList.add("analyser");

    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    canvas.id = `${module.id}-content-controllers-canvas`;
    canvas.className = "analyserCanvas";

    module.onConnectInput = () => {
        animationID = module.visualizeOn(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, module.content.options.select.value);
    };

    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();
}
