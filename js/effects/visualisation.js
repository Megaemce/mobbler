import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function visualisation(event, initalZoom, initalColor, initalBarWidth, initalLineWidth, initalSymmetries, initalScaleDivider) {
    const zoom = initalZoom || 5;
    const color = initalColor || 180;
    const barWidth = initalBarWidth || 3.5;
    const lineWidth = initalLineWidth || 50;
    const symmetries = initalSymmetries || 6;
    const scaleDivider = initalScaleDivider || 5.5;

    const canvasWidth = 180;
    const canvasHeight = 100;
    const fftSizeSineWave = 128;

    let module = new Module("visualisation", true, false, false, undefined);
    let maximizeButton = document.createElement("button");

    maximizeButton.classList.add("maximize");
    maximizeButton.classList.add("button");

    maximizeButton.id = "maximize";
    module.head.buttonsWrapper.appendChild(maximizeButton);
    module.head.buttonsWrapper.maximize = maximizeButton;

    // custom attributes
    module.audioNode = new AnalyserNode(audioContext);
    module.audioNode.zoom = { value: zoom };
    module.audioNode.color = { value: color };
    module.audioNode.barWidth = { value: barWidth };
    module.audioNode.symmetries = { value: symmetries };
    module.audioNode.lineWidth = { value: lineWidth };
    module.audioNode.scaleDivider = { value: scaleDivider };

    module.createSlider("zoom", zoom, 0.1, 9.9, 0.1, "", false, "option 6");
    module.createSlider("color", color, 0, 360, 1, "", false, "option 4");
    module.createSlider("bar Width", barWidth, 1, 6, 0.1, "", false, "option 1");
    module.createSlider("symmetries", symmetries, 3, 9, 1, "", false, "option 3");
    module.createSlider("line Width", lineWidth, 1, 99, 1, "", false, "option 5");
    module.createSlider("scale Divider", scaleDivider, 1, 10, 0.1, "", false, "option 2");

    module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, undefined, "free");

    module.content.controllers.classList.add("visualisation");

    // only one visual possible thus hide output button
    document.getElementById("visualisation").style.display = "none";

    module.onDeletion = () => {
        document.getElementById("visualisation").style.display = "block";
    };
}
