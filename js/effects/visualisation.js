import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function visualisation(event, initalSmoothing) {
    const canvasWidth = 180;
    const canvasHeight = 100;
    const fftSizeSineWave = 128;
    const smoothingTimeConstant = initalSmoothing || 0.25;

    let module = new Module("visualisation", true, false, false, undefined);
    let maximizeButton = document.createElement("button");

    maximizeButton.classList.add("maximize");
    maximizeButton.classList.add("button");

    maximizeButton.id = "maximize";
    module.head.buttonsWrapper.appendChild(maximizeButton);
    module.head.buttonsWrapper.maximize = maximizeButton;

    module.audioNode = audioContext.createAnalyser();
    module.audioNode.smoothingTimeConstant = smoothingTimeConstant;

    module.audioNode.barWidth = { value: undefined };
    module.audioNode.scaleDivider = { value: undefined };
    module.audioNode.symmetries = { value: undefined };
    module.audioNode.color = { value: undefined };
    module.audioNode.lineWidth = { value: undefined };
    module.audioNode.zoom = { value: undefined };

    module.createSlider("bar Width", 1, 1, 6, 0.1, "", false, "option 1");
    module.createSlider("scale Divider", 1, 1, 10, 0.1, "", false, "option 2");
    module.createSlider("symmetries", 8, 2, 10, 1, "", false, "option 3");
    module.createSlider("color", 1, 1, 360, 1, "", false, "option 4");
    module.createSlider("line Width", 1, 1, 100, 1, "", false, "option 5");
    module.createSlider("zoom", 0.1, 0.1, 10, 0.1, "", false, "option 6");

    module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, undefined, "free");

    module.content.controllers.classList.add("visualisation");

    // only one visual possible thus hide output button
    document.getElementById("visualisation").style.display = "none";

    module.onDeletion = () => {
        document.getElementById("visualisation").style.display = "block";
    };
}
