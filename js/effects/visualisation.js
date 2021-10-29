import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function visualisation(event, initalSmoothing) {
    const canvasWidth = 180;
    const canvasHeight = 100;
    const fftSizeSineWave = 128;
    const smoothingTimeConstant = initalSmoothing || 0.25;

    let module = new Module("visualisation", true, false, false, undefined);
    let maximizeButton = document.createElement("a");

    maximizeButton.className = "maximize";
    maximizeButton.id = "maximize";
    module.head.buttonsWrapper.appendChild(maximizeButton);
    module.head.buttonsWrapper.maximize = maximizeButton;

    module.audioNode = audioContext.createAnalyser();
    module.audioNode.smoothingTimeConstant = smoothingTimeConstant;

    module.audioNode.parameterBarWidth = { value: undefined };
    module.audioNode.parameterScaleDivider = { value: undefined };
    module.audioNode.parameterSymmetries = { value: undefined };
    module.audioNode.parameterColor = { value: undefined };

    module.createSlider("parameterBarWidth", 1, 1, 6, 0.1, "", false, "option 1");
    module.createSlider("parameterScaleDivider", 1, 1, 10, 0.1, "", false, "option 2");
    module.createSlider("parameterSymmetries", 8, 2, 10, 1, "", false, "option 3");
    module.createSlider("parameterColor", 1, 1, 360, 1, "", false, "option 3");

    module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, undefined, "free");

    module.content.controllers.classList.add("visualisation");

    // only one visual possible thus hide output button
    document.getElementById("visualisation").style.visibility = "hidden";

    module.onDeletion = () => {
        document.getElementById("visualisation").style.visibility = "visible";
    };
}
