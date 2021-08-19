import createModule from "../createModuleObject.js";
import audioContext from "../../main.js";
import Cable from "../../classes/Cable.js";

let drawVisual;
const visualSettings = ["sine wave", "frequency bars"];
const canvasHeight = 140;
const canvasWidth = 240;
const fftSizeFrequencyBars = 512;
const fftSizeSineWave = 2048;

// create analyser on given module with given setting
export function visualizeOn(module, style) {
    let canvas = module.content.canvas;

    if (canvas) canvas.remove();

    canvas = document.createElement("canvas");
    canvas.id = `${module.id}-content-controllers-canvas`;
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    canvas.className = "analyserCanvas";

    module.content.appendChild(canvas);
    module.content.canvas = canvas;

    let ctx = (module.content.drawingContext = canvas.getContext("2d"));

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (style === "frequency bars") {
        module.audioNode.fftSize = fftSizeFrequencyBars;
        let bufferLengthAlt = module.audioNode.frequencyBinCount; //it's always half of fftSize
        let dataArrayAlt = new Uint8Array(bufferLengthAlt);

        let drawBar = function () {
            drawVisual = requestAnimationFrame(drawBar);

            module.audioNode.getByteFrequencyData(dataArrayAlt);
            // data returned in dataArrayAlt array will in range [0-255]

            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            let barWidth = (canvasWidth / bufferLengthAlt) * 2.5;
            let x = 0;

            dataArrayAlt.forEach((barHeight) => {
                ctx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
                // contex grid is upside down so we substract from y value
                ctx.fillRect(x, canvasHeight - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth + 1;
            });
        };
        drawBar();
    }
    if (style === "sine wave") {
        let bufferLength = (module.audioNode.fftSize = fftSizeSineWave);
        let dataArray = new Uint8Array(bufferLength);

        let drawWave = function () {
            drawVisual = requestAnimationFrame(drawWave);

            module.audioNode.getByteTimeDomainData(dataArray);
            // data returned in dataArray will be in range [0-255]

            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgb(0, 0, 0)";
            ctx.beginPath();

            dataArray.forEach((element, index) => {
                let x = (canvasWidth / bufferLength) * index; // sliceWidth * index
                let y = (element * canvasHeight) / 256; // 256 comes from dataArray max value;
                if (!index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });

            ctx.stroke();
        };
        drawWave();
    }
}

export default function createAnalyser(event, initalSmoothingTimeConstant, initalMaxDecibels, initalType) {
    let module = createModule("analyser", true, false, false, visualSettings);
    let canvas = document.createElement("canvas");

    module.content.options.select.onchange = function () {
        window.cancelAnimationFrame(drawVisual);
        visualizeOn(module, visualSettings[this.selectedIndex]);
    };

    module.audioNode = audioContext.createAnalyser();
    module.audioNode.smoothingTimeConstant = initalSmoothingTimeConstant;
    module.audioNode.maxDecibels = initalMaxDecibels;

    module.content.drawingContext = canvas.getContext("2d");
    module.content.appendChild(canvas);
    module.content.canvas = canvas;

    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    canvas.id = `${module.id}-content-controllers-canvas`;
    canvas.className = "analyserCanvas";

    module.onConnectInput = function () {
        visualizeOn(module, initalType);
    };

    new Cable(module); // create first inital cable linked to module

    event.preventDefault();
}
