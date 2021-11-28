import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function visualisation(event, initalZoom, initalColor, initalBarWidth, initalLineWidth, initalSymmetries, initalScaleDivider) {
    const zoom = parseFloat(initalZoom || 5);
    const color = parseFloat(initalColor || 180);
    const barWidth = parseFloat(initalBarWidth || 3.5);
    const lineWidth = parseFloat(initalLineWidth || 50);
    const symmetries = parseFloat(initalSymmetries || 6);
    const scaleDivider = parseFloat(initalScaleDivider || 5.5);
    const zoomInfo = "Canvas zoom volume for new lines";
    const colorInfo = "Line color in HSL";
    const barWidthInfo = "Audio to line detail factor. Less make more details visible";
    const lineWidthInfo = "Line width in pixels";
    const symmetriesInfo = "Number of kaleidoscope reflection";
    const scaleDividerInfo = "Effect quite similar to zoom. Less make the line closer";

    const canvasWidth = 180;
    const canvasHeight = 100;
    const fftSizeSineWave = 128;
    const maximizeButton = document.createElement("button");

    const module = new Module("visualisation", true, false, false, undefined);

    maximizeButton.classList = "button maximize";
    maximizeButton.id = "maximize";

    module.head.buttonsWrapper.appendChild(maximizeButton);
    module.head.buttonsWrapper.maximize = maximizeButton;

    // custom attributes
    module.audioNode = new AnalyserNode(audioContext);
    module.audioNode.zoom = { value: zoom };
    module.audioNode.color = { value: color };
    module.audioNode.barWidth = { value: barWidth };
    module.audioNode.lineWidth = { value: lineWidth };
    module.audioNode.symmetries = { value: symmetries };
    module.audioNode.scaleDivider = { value: scaleDivider };

    module.createSlider("zoom", zoom, 0.1, 9.9, 0.1, "", false, zoomInfo);
    module.createSlider("color", color, 0, 360, 1, "HSL", false, colorInfo);
    module.createSlider("bar Width", barWidth, 1, 6, 0.1, "px", false, barWidthInfo);
    module.createSlider("line Width", lineWidth, 1, 99, 1, "px", false, lineWidthInfo);
    module.createSlider("symmetries", symmetries, 3, 9, 1, "", false, symmetriesInfo);
    module.createSlider("scale Divider", scaleDivider, 1, 10, 0.1, "", false, scaleDividerInfo);

    module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, undefined, "free");

    module.content.controllers.classList.add("visualisation");

    // only one visual possible thus hide output submenu button
    document.getElementById("visualisation").style.display = "none";

    module.onDeletion = () => {
        document.getElementById("visualisation").style.display = "block";
    };
}
