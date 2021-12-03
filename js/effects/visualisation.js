import Visualizer from "../classes/ModuleVisualizer.js";
import { displayAlertOnElement } from "../helpers/builders.js";

export default function visualisation(event, initalType, initalCanvasWidth, initalCanvasHeight, initatFFTSize, initalZoom, initalColor, initalLineWidth, initalLineLength, initalSymmetries, initalLineFlatness) {
    const lineCreatorTypes = ["create lines from frequencies chart", "create lines from time domain chart"];
    const type = initalType === undefined ? lineCreatorTypes[0] : initalType;
    const zoom = parseFloat(initalZoom || 1);
    const color = parseFloat(initalColor || 180);
    const lineWidth = parseFloat(initalLineWidth || 1);
    const lineLength = parseFloat(initalLineLength || 3.5);
    const symmetries = parseFloat(initalSymmetries || 6);
    const canvasWidth = parseFloat(initalCanvasWidth || 180);
    const canvasHeight = parseFloat(initalCanvasHeight || 100);
    const lineFlatness = parseFloat(initalLineFlatness || 1);
    const fftSizeSineWave = parseFloat(initatFFTSize || 128);
    const zoomInfo = "Canvas zoom volume for new lines";
    const colorInfo = "Line color in HSL";
    const lineWidthInfo = "Line width in pixels";
    const lineLengthInfo = "Extend or shring the line length";
    const symmetriesInfo = "Number of kaleidoscope reflection";
    const lineFlatnessInfo = "Roughness of the line. Move make the line more detailed";
    const maximizeButton = document.createElement("button");

    const module = new Visualizer("visualisation", lineCreatorTypes, type, canvasWidth, canvasHeight, fftSizeSineWave);

    maximizeButton.classList = "button maximize";
    maximizeButton.id = "maximize";

    module.head.buttonsWrapper.appendChild(maximizeButton);
    module.head.buttonsWrapper.maximize = maximizeButton;

    // custom attributes
    module.audioNode.type = type;
    module.audioNode.zoom = { value: zoom };
    module.audioNode.color = { value: color };
    module.audioNode.lineWidth = { value: lineWidth };
    module.audioNode.lineLength = { value: lineLength };
    module.audioNode.symmetries = { value: symmetries };
    module.audioNode.lineFlatness = { value: lineFlatness };

    module.createSlider("zoom", zoom, 0.1, 2, 0.1, "", false, zoomInfo);
    module.createSlider("color", color, 0, 360, 1, "HSL", false, colorInfo);
    module.createSlider("line Width", lineWidth, 1, 99, 1, "px", false, lineWidthInfo);
    module.createSlider("line Length", lineLength, 1, 6, 0.1, "", false, lineLengthInfo);
    module.createSlider("symmetries", symmetries, 3, 9, 1, "", false, symmetriesInfo);
    module.createSlider("line Flatness", lineFlatness, 0.1, 1, 0.01, "", false, lineFlatnessInfo);

    module.content.options.select.value = type;

    module.content.controllers.canvasDiv.classList.add("visualisation"); // white background

    // when switching type it might be that module is not active thus reset everything and start listening again
    module.content.options.select.onchange = function () {
        module.audioNode.type = this.value;
        module.resetAnalyser();
    };

    // only one output possible per project
    const visualisationButton = document.getElementById("visualisation");
    visualisationButton.style.cursor = "not-allowed";
    visualisationButton.removeEventListener("mousedown", visualisation);
    visualisationButton.onmouseover = () => {
        displayAlertOnElement("Only one visualisation per project", visualisationButton);
    };

    // when deleting the module freed the animation and the visualisation button in the submenu
    module.onDeletion = () => {
        window.cancelAnimationFrame(module.animationID["analyser"]);
        window.cancelAnimationFrame(module.listeningID);
        visualisationButton.style.cursor = "pointer";
        visualisationButton.onmouseover = undefined;
        visualisationButton.addEventListener("mousedown", visualisation);
    };

    return module;
}
