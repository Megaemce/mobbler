import createModule from './createModule.js';
import {
    audioContext
}
from './main.js'

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
            let bufferLengthAlt = module.audioNode.frequencyBinCount
            let dataArrayAlt = new Uint8Array(bufferLengthAlt);

            let drawBar = function () {
                drawVisual = requestAnimationFrame(drawBar);

                module.audioNode.getByteFrequencyData(dataArrayAlt);

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);

                let barWidth = (width / bufferLengthAlt) * 2.5;
                let x = 0;

                for (let i = 0; i < bufferLengthAlt; i++) {
                    let barHeight = dataArrayAlt[i];

                    ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                    ctx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);

                    x += barWidth + 1;
                }
            };

            drawBar();
            break;

        case "sine wave":
            module.audioNode.fftSize = 2048;
            let bufferLength = module.audioNode.fftSize;
            let dataArray = new Uint8Array(bufferLength);

            let drawWave = function () {
                drawVisual = requestAnimationFrame(drawWave);

                module.audioNode.getByteTimeDomainData(dataArray);

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                ctx.beginPath();

                let sliceWidth = width * 1.0 / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {

                    let v = dataArray[i] / 128.0;
                    let y = v * height / 2;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                ctx.lineTo(canvas.width + 20, canvas.height / 2);
                ctx.stroke();
            };

            drawWave();
            break;
    }
}

export default function createAnalyser() {
    let module = createModule("analyser", true, true, false, false, visualSettings);
    let content = document.getElementById(`${module.id}-content`);
    let select = document.getElementById(`${module.id}-footer-select`)
    let canvas = document.createElement("canvas");

    select.onchange = function () {
        window.cancelAnimationFrame(drawVisual);
        visualizeOn(module.id, `${module.id}-content`, visualSettings[this.selectedIndex], 240, 140);
    }

    module.audioNode = audioContext.createAnalyser()
    module.audioNode.smoothingTimeConstant = "0.25"; // not much smoothing
    module.audioNode.maxDecibels = 0;

    content.drawingContext = canvas.getContext('2d');
    content.appendChild(canvas);

    canvas.height = 140;
    canvas.width = 240;
    canvas.id = `${module.id}-content-canvas`
    canvas.className = "analyserCanvas";
    canvas.style.backgroundImage = "url('img/analyser-bg.png')";

    module.onConnectInput = function () {
        visualizeOn(module.id, `${module.id}-content`, visualSettings[0], 240, 140)
    };

    if (this.event)
        this.event.preventDefault();
}