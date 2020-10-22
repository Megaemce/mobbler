import createModule from '../structure/createModule.js';
import {
    audioContext
}
from '../main.js'

function addOpenFileButtonTo(element) {
    let input = document.createElement("input");
    let button = document.createElement("button");
    let option = document.createElement("option");

    input.style = "display: none;";
    input.type = "file";
    input.id = "file-input";

    button.innerText = "Open file..."
    button.id = "button"

    option.id = "file button"
    option.appendChild(button);
    option.appendChild(input);

    element.appendChild(option);
}

function openFileHandler(fileButton, module) {
    let input = document.getElementById('file-input');
    // when file is choosen
    input.onchange = function () {
        let fileLoaded = this.files[0];
        let reader = new FileReader()
        // when file is loaded as array buffer
        reader.onload = function () {
            let fileAsArrayBuffer = this.result;
            // when file is decoded as an audio
            audioContext.decodeAudioData(fileAsArrayBuffer).then(function (decodedData) {
                // store it as an module buffer
                module.buffer = decodedData;
                audioContext.nameSoundBuffer[fileLoaded.name] = decodedData;
            })
        };
        reader.onerror = () => {
            alert("Error: " + reader.error);
        };
        reader.readAsArrayBuffer(fileLoaded);

        fileButton.innerHTML = fileLoaded.name;
        fileButton.removeAttribute("id") // not button anymore
        addOpenFileButtonTo(fileButton.parentNode)
    };
    input.click();
}

function stopSound(module, playButton) {
    playButton.isPlaying = false;
    playButton.classList.remove("switch-on");

    if (module.stopTimer) {
        window.clearTimeout(module.stopTimer);
        module.stopTimer = 0;
    }
}

function playSelectedSound(module, playButton) {
    let loop = document.getElementById(`${module.id}-content-options-checkbox`).checked
    console.log()
    let selectedBufferName = document.getElementById(`${module.id}-content-options-select`).value

    if (playButton.isPlaying)
        stopSound(module, playButton);
    else {
        playButton.isPlaying = true;
        playButton.classList.add("switch-on");

        // if there's already a note playing, cut it off.
        if (module.audioNode) {
            module.audioNode.stop(0);
            module.audioNode.disconnect();
            module.audioNode = null
        }

        // create a new BufferSource, set it to the buffer and connect it.
        module.audioNode = audioContext.createBufferSource();
        module.loop = loop;
        module.buffer = audioContext.nameSoundBuffer[selectedBufferName];

        // play sound on all connected output
        if (module.outcomingCables) {
            module.outcomingCables.forEach(function (cable) {
                module.audioNode.connect(cable.destination.audioNode);
            });
        }
        module.audioNode.start(audioContext.currentTime);
        let delay = Math.floor(module.buffer.duration * 1000) + 1;
        if (!module.loop)
            module.stopTimer = window.setTimeout(stopSound, delay, module, playButton);
    }
}

export default function createAudioBufferSource(event, initalLoop, initalBufferName) {
    let soundNames =  Object.keys(audioContext.nameSoundBuffer);
    let module = createModule("audio buffer source", false, true, true, false, soundNames);
    let playButton = document.createElement("div");
    let moduleControllers = document.getElementById(`${module.id}-content-controllers`)
    let select = document.getElementById(`${module.id}-content-options-select`)

    playButton.classList.add("switch");
    playButton.onclick = function() {
        playSelectedSound(module, this)
    };

    moduleControllers.appendChild(playButton);

    addOpenFileButtonTo(select);

    // when select changes
    select.onchange = function () {
        // select get changed later when the file is open thus onchange 
        // get executed once more - we want to ignore this callout
        if (this.type == "file")
            return

        let clickedOption = this[this.selectedIndex]

        if (clickedOption.id == 'file button') {
            openFileHandler(this[this.selectedIndex], module);
        } else {
            module.buffer = audioContext.nameSoundBuffer[this.value];
        }
    };

    module.loop = initalLoop;
    module.buffer = audioContext.nameSoundBuffer[initalBufferName];
    console.log(audioContext.nameSoundBuffer)

    event.preventDefault();
}