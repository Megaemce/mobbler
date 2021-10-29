import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function visualisation(event, initalSmoothing) {
    const canvasWidth = 180;
    const canvasHeight = 100;
    const fftSizeSineWave = 128;
    const smoothingTimeConstant = initalSmoothing || 0.25;

    let module = new Module("visualisation", true, false, false, undefined);

    module.createSlider("option1", 1, 0, 100, 1, "", true, "option 1");
    module.createSlider("option2", 1, 0, 100, 1, "", true, "option 2");
    module.createSlider("option3", 1, 0, 100, 1, "", true, "option 3");

    module.audioNode = audioContext.createAnalyser();
    module.audioNode.smoothingTimeConstant = smoothingTimeConstant;

    module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, undefined, "free");

    module.content.controllers.classList.add("visualisation");

    // only one visual possible thus hide output button
    document.getElementById("visualisation").style.visibility = "hidden";

    module.onDeletion = () => {
        document.getElementById("visualisation").style.visibility = "visible";
    };
}
