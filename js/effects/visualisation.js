import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

class ExtenderAnalyser extends AnalyserNode {
    constructor(barWidth, scaleDivider, symmetries, color, lineWidth, zoom, audioContext) {
        super(audioContext);
        this.innerBarWidth = { value: barWidth };
        this.innerScaleDivider = { value: scaleDivider };
        this.innerSymmetries = { value: symmetries };
        this.innerColor = { value: color };
        this.innerLineWidth = { value: lineWidth };
        this.inneZzoom = { value: zoom };
    }
    set barWidth(value) {
        this.innerBarWidth.value = value;
    }
    get barWidth() {
        return this.innerBarWidth;
    }
    set scaleDivider(value) {
        this.innerScaleDivider.value = value;
    }
    get scaleDivider() {
        return this.innerScaleDivider;
    }
    set symmetries(value) {
        this.innerSymmetries.value = value;
    }
    get symmetries() {
        return this.innerSymmetries;
    }
    get color() {
        return this.innerColor;
    }
    set color(value) {
        this.innerColor.value = value;
    }
    get lineWidth() {
        return this.innerLineWidth;
    }
    set lineWidth(value) {
        this.innerLineWidth.value = value;
    }
    get zoom() {
        return this.inneZzoom;
    }
    set zoom(value) {
        this.inneZzoom.value = value;
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

    let module = new Module("visualisation", true, false, false, undefined, false);
    let maximizeButton = document.createElement("button");

    maximizeButton.classList.add("maximize");
    maximizeButton.classList.add("button");

    maximizeButton.id = "maximize";
    module.head.buttonsWrapper.appendChild(maximizeButton);
    module.head.buttonsWrapper.maximize = maximizeButton;

    module.audioNode = new ExtenderAnalyser(barWidth, scaleDivider, symmetries, color, lineWidth, zoom, audioContext);

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
