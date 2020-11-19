import createModule from '../structure/createModule.js';
import audioContext from '../main.js'

let drawVisual;
let visualSettings = ["sine wave", "frequency bars"];

// create analyser on given module with given setting
export function visualizeOn(moduleID, placeID, style, width, height) {
    let module = document.getElementById(moduleID)
    let modulePlace = document.getElementById(placeID);
    let canvas = document.getElementById(`${placeID}-canvas`)

    if (canvas) {
        canvas.remove()
    }

    canvas = document.createElement("canvas");
    canvas.id = `${placeID}-canvas`
    canvas.height = height;
    canvas.width = width;
    canvas.className = "analyserCanvas";
    canvas.style.backgroundImage = "url('img/analyser-bg.png')";

    modulePlace.appendChild(canvas);

    let ctx = modulePlace.drawingContext = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    switch (style) {
        case "frequency bars":
            module.audioNode.fftSize = 512;
            let bufferLengthAlt = module.audioNode.frequencyBinCount; //it's always half of fftSize
            let dataArrayAlt = new Uint8Array(bufferLengthAlt);

            let drawBar = function () {
                drawVisual = requestAnimationFrame(drawBar);

                module.audioNode.getByteFrequencyData(dataArrayAlt);
                // data returned in dataArrayAlt array will in range [0-255]

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);

                let barWidth = (width / bufferLengthAlt) * 2.5;
                let x = 0;

                dataArrayAlt.forEach(barHeight => {
                    ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                    // contex grid is upside down so we substract from y value
                    ctx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);

                    x += barWidth + 1;
                })
            };

            drawBar();
            break;

        case "sine wave":
            let bufferLength = module.audioNode.fftSize = 2048;
            let dataArray = new Uint8Array(bufferLength);

            let drawWave = function () {
                drawVisual = requestAnimationFrame(drawWave);

                module.audioNode.getByteTimeDomainData(dataArray);
                // data returned in dataArray will be in range [0-255]

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                ctx.beginPath();

                dataArray.forEach((element, index) => {
                    let x = (width / bufferLength) * index; // sliceWidth * index
                    let y = element * height / 256 // 256 comes from dataArray max value;
                    if (!index === 0)
                        ctx.moveTo(x, y);
                    else
                        ctx.lineTo(x, y);
                });

                //ctx.lineTo(canvas.width + 20, canvas.height / 2);
                ctx.stroke();
            };

            drawWave();
            break;
    }
}

export default function createAnalyser(event, initalSmoothingTimeConstant, initalMaxDecibels, initalType) {
    let module = createModule("analyser", true, false, false, visualSettings);
    let content = document.getElementById(`${module.id}-content-controllers`);
    let select = document.getElementById(`${module.id}-content-options-select`)
    let canvas = document.createElement("canvas");

    select.onchange = function () {
        window.cancelAnimationFrame(drawVisual);
        visualizeOn(module.id, content.id, visualSettings[this.selectedIndex], 240, 140);
    }

    module.audioNode = audioContext.createAnalyser();
    module.audioNode.smoothingTimeConstant = initalSmoothingTimeConstant;
    module.audioNode.maxDecibels = initalMaxDecibels;

    content.drawingContext = canvas.getContext('2d');
    content.appendChild(canvas);

    canvas.height = 140;
    canvas.width = 240;
    canvas.id = `${module.id}-content-controllers-canvas`
    canvas.className = "analyserCanvas";
    canvas.style.backgroundImage = "url('img/analyser-bg.png')";

    module.onConnectInput = function () {
        visualizeOn(module.id, content.id, initalType, 240, 140)
    };

    event.preventDefault();
}