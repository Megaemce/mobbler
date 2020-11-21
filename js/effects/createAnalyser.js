import createModule from '../structure/createModule.js';
import audioContext from '../main.js'

let drawVisual;
const visualSettings = ["sine wave", "frequency bars"];
const canvasHeight = 140;
const canvasWidth = 240;
const fftSizeFrequencyBars = 512;
const fftSizeSineWave = 2048;

// create analyser on given module with given setting
export function visualizeOn(module, placeID, style) {
    let modulePlace = document.getElementById(placeID);
    let canvas = document.getElementById(`${placeID}-canvas`)

    if (canvas)
        canvas.remove()

    canvas = document.createElement("canvas");
    canvas.id = `${placeID}-canvas`
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    canvas.className = "analyserCanvas";

    modulePlace.appendChild(canvas);

    let ctx = modulePlace.drawingContext = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (style === "frequency bars") {
        module.audioNode.fftSize = fftSizeFrequencyBars;
        let bufferLengthAlt = module.audioNode.frequencyBinCount; //it's always half of fftSize
        let dataArrayAlt = new Uint8Array(bufferLengthAlt);

        let drawBar = function () {
            drawVisual = requestAnimationFrame(drawBar);

            module.audioNode.getByteFrequencyData(dataArrayAlt);
            // data returned in dataArrayAlt array will in range [0-255]

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            let barWidth = (canvasWidth / bufferLengthAlt) * 2.5;
            let x = 0;

            dataArrayAlt.forEach(barHeight => {
                ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                // contex grid is upside down so we substract from y value
                ctx.fillRect(x, canvasHeight - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth + 1;
            })
        };
        drawBar();
    }
    if (style === "sine wave") {
        let bufferLength = module.audioNode.fftSize = fftSizeSineWave;
        let dataArray = new Uint8Array(bufferLength);

        let drawWave = function () {
            drawVisual = requestAnimationFrame(drawWave);

            module.audioNode.getByteTimeDomainData(dataArray);
            // data returned in dataArray will be in range [0-255]

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(0, 0, 0)';
            ctx.beginPath();

            dataArray.forEach((element, index) => {
                let x = (canvasWidth / bufferLength) * index; // sliceWidth * index
                let y = element * canvasHeight / 256 // 256 comes from dataArray max value;
                if (!index === 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);
            });

            ctx.stroke();
        };
        drawWave();
    }
}

export default function createAnalyser(event, initalSmoothingTimeConstant, initalMaxDecibels, initalType) {
    let module = createModule("analyser", true, false, false, visualSettings);
    let content = document.getElementById(`${module.id}-content-controllers`);
    let select = document.getElementById(`${module.id}-content-options-select`)
    let canvas = document.createElement("canvas");

    select.onchange = function () {
        window.cancelAnimationFrame(drawVisual);
        visualizeOn(module, content.id, visualSettings[this.selectedIndex]);
    }

    module.audioNode = audioContext.createAnalyser();
    module.audioNode.smoothingTimeConstant = initalSmoothingTimeConstant;
    module.audioNode.maxDecibels = initalMaxDecibels;

    content.drawingContext = canvas.getContext('2d');
    content.appendChild(canvas);

    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    canvas.id = `${module.id}-content-controllers-canvas`
    canvas.className = "analyserCanvas";

    module.onConnectInput = function () {
        visualizeOn(module, content.id, initalType)
    };

    event.preventDefault();
}