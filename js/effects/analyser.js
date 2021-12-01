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
    const analyserTypes = ["sine wave", "frequency bars", "spectogram"];

    const module = new Module("analyser", true, false, false, analyserTypes);

    // set audioNode with inital values
    module.audioNode = new AnalyserNode(audioContext, {
        maxDecibels: maxDecibels,
        smoothingTimeConstant: smoothingTimeConstant,
    });

    // create inital analyser (it should be empty as nothing is talking to the new module)
    module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, type);

    // change analyser type
    module.content.options.select.onchange = function () {
        module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, this.value);
    };

    // when deleting the module freed the animation
    module.onDeletion = () => {
        window.cancelAnimationFrame(module.animationID["analyser"]);
    };

    // if animation get stopped by source module deletion restart it after new connection arrive
    module.onConnectInput = () => {
        if (!module.inputActivity) {
            module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, module.content.options.select.value);
        }
    };
}
