import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function visualisation(event, initalZoom, initalColor, initalLineWidth, initalLineLength, initalSymmetries, initalScaleDivider) {
    const zoom = parseFloat(initalZoom || 1);
    const color = parseFloat(initalColor || 180);
    const lineWidth = parseFloat(initalLineWidth || 50);
    const lineLength = parseFloat(initalLineLength || 3.5);
    const symmetries = parseFloat(initalSymmetries || 6);
    const scaleDivider = parseFloat(initalScaleDivider || 1);
    const lineCreatorTypes = ["bands", "wave"];
    const zoomInfo = "Canvas zoom volume for new lines";
    const colorInfo = "Line color in HSL";
    const lineWidthInfo = "Line width in pixels";
    const lineLengthInfo = "Extend or shring the line length";
    const symmetriesInfo = "Number of kaleidoscope reflection";
    const scaleDividerInfo = "Effect quite similar to zoom. Less make the line closer";

    const canvasWidth = 180;
    const canvasHeight = 100;
    const fftSizeSineWave = 128;
    const maximizeButton = document.createElement("button");

    const module = new Module("visualisation", true, false, false, lineCreatorTypes);

    maximizeButton.classList = "button maximize";
    maximizeButton.id = "maximize";

    module.head.buttonsWrapper.appendChild(maximizeButton);
    module.head.buttonsWrapper.maximize = maximizeButton;

    // custom attributes
    module.audioNode = new AnalyserNode(audioContext);
    module.audioNode.type = "wave";
    module.audioNode.zoom = { value: zoom };
    module.audioNode.color = { value: color };
    module.audioNode.lineWidth = { value: lineWidth };
    module.audioNode.lineLength = { value: lineLength };
    module.audioNode.symmetries = { value: symmetries };
    module.audioNode.scaleDivider = { value: scaleDivider };

    module.createSlider("zoom", zoom, 0.1, 9.9, 0.1, "", false, zoomInfo);
    module.createSlider("color", color, 0, 360, 1, "HSL", false, colorInfo);
    module.createSlider("line Width", lineWidth, 1, 99, 1, "px", false, lineWidthInfo);
    module.createSlider("line Length", lineLength, 1, 6, 0.1, "", false, lineLengthInfo);
    module.createSlider("symmetries", symmetries, 3, 9, 1, "", false, symmetriesInfo);
    module.createSlider("scale Divider", scaleDivider, 0.1, 1, 0.01, "", false, scaleDividerInfo);

    module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, undefined, "free");

    module.content.controllers.classList.add("visualisation");

    module.content.options.select.value = "wave";
    module.content.options.select.onchange = function () {
        module.audioNode.type = this.value;
    };

    // only one output possible per project
    const visualisationButton = document.getElementById("visualisation");
    visualisationButton.style.cursor = "not-allowed";
    visualisationButton.onmousedown = undefined;
    visualisationButton.onmouseover = () => {
        displayAlertOnElement("Only one visualisation per project", visualisationButton);
    };

    module.onDeletion = () => {
        visualisationButton.style.cursor = "pointer";
        visualisationButton.onmouseover = undefined;
        visualisationButton.addEventListener("mousedown", visualisation);
    };
}
