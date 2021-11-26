import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

class Visualisation extends AnalyserNode {
    constructor(barWidth, scaleDivider, symmetries, color, lineWidth, zoom, audioContext) {
        super(audioContext);
        this._barWidth = { value: barWidth };
        this._scaleDivider = { value: scaleDivider };
        this._symmetries = { value: symmetries };
        this._color = { value: color };
        this._lineWidth = { value: lineWidth };
        this._zoom = { value: zoom };
        this._audioContext = audioContext;
    }
    set barWidth(value) {
        this._barWidth.value = value;
    }
    get barWidth() {
        return this._barWidth;
    }
    set scaleDivider(value) {
        this._scaleDivider.value = value;
    }
    get scaleDivider() {
        return this._scaleDivider;
    }
    set symmetries(value) {
        this._symmetries.value = value;
    }
    get symmetries() {
        return this._symmetries;
    }
    get color() {
        return this._color;
    }
    set color(value) {
        this._color.value = value;
    }
    get lineWidth() {
        return this._lineWidth;
    }
    set lineWidth(value) {
        this._lineWidth.value = value;
    }
    get zoom() {
        return this._zoom;
    }
    set zoom(value) {
        this._zoom.value = value;
    }
}

export default function visualisation(event, initalZoom, initalColor, initalBarWidth, initalLineWidth, initalSymmetries, initalScaleDivider, initalSmoothing) {
    const zoom = initalZoom || 5;
    const color = initalColor || 180;
    const barWidth = initalBarWidth || 3.5;
    const lineWidth = initalLineWidth || 50;
    const symmetries = initalSymmetries || 6;
    const scaleDivider = initalScaleDivider || 5.5;

    const canvasWidth = 180;
    const canvasHeight = 100;
    const fftSizeSineWave = 128;
    const smoothingTimeConstant = initalSmoothing || 0.25;

    let module = new Module("visualisation", true, false, false, undefined, true);
    let maximizeButton = document.createElement("button");

    maximizeButton.classList.add("maximize");
    maximizeButton.classList.add("button");

    maximizeButton.id = "maximize";
    module.head.buttonsWrapper.appendChild(maximizeButton);
    module.head.buttonsWrapper.maximize = maximizeButton;

    module.audioNode = new Visualisation(barWidth, scaleDivider, symmetries, color, lineWidth, zoom, audioContext);

    module.createSlider("bar Width", barWidth, 1, 6, 0.1, "", false, "option 1");
    module.createSlider("scale Divider", scaleDivider, 1, 10, 0.1, "", false, "option 2");
    module.createSlider("symmetries", symmetries, 3, 9, 1, "", false, "option 3");
    module.createSlider("color", color, 0, 360, 1, "", false, "option 4");
    module.createSlider("line Width", lineWidth, 1, 99, 1, "", false, "option 5");
    module.createSlider("zoom", zoom, 0.1, 9.9, 0.1, "", false, "option 6");

    module.createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, undefined, "free");

    module.content.controllers.classList.add("visualisation");

    // only one visual possible thus hide output button
    document.getElementById("visualisation").style.display = "none";

    module.onDeletion = () => {
        document.getElementById("visualisation").style.display = "block";
    };
}
