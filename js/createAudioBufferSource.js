import createModule from './createModule.js';
import {
    soundBuffer,
    sounds,
    audioContext
} from './main.js';


function addOpenFileButtonTo(element) {
    let option = document.createElement("option");
    option.innerHTML = "<button id='button'>Open file...</button><input id='file-input' type='file' name='name' style='display: none;' />"
    option.id = "button"
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
                soundBuffer.push(decodedData);
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
    playButton.src = "img/switch_off.svg";

    if (module.stopTimer) {
        window.clearTimeout(module.stopTimer);
        module.stopTimer = 0;
    }


}

function playSelectedSound(module, playButton) {
    let loop = document.getElementById(`${module.id}-footer-checkbox`).checked
    let selectedBuffer = document.getElementById(`${module.id}-footer-select`).selectedIndex

    if (playButton.isPlaying)
        stopSound(module, playButton);
    else {
        playButton.isPlaying = true;
        playButton.src = "img/switch_on.svg";

        // if there's already a note playing, cut it off.
        if (module.audioNode) {
            module.audioNode.stop(0);
            module.audioNode.disconnect();
            module.audioNode = null
        }

        // create a new BufferSource, set it to the buffer and connect it.
        module.audioNode = audioContext.createBufferSource();
        module.loop = loop;
        module.buffer = soundBuffer[selectedBuffer];

        // play sound on all connected output
        if (module.outputConnections) {
            module.outputConnections.forEach(function (connection) {
                console.log(connection.destination);
                module.audioNode.connect(connection.destination.audioNode);
            });
        }
        module.audioNode.start(audioContext.currentTime);
        let delay = Math.floor(module.buffer.duration * 1000) + 1;
        if (!module.loop)
            module.stopTimer = window.setTimeout(stopSound, delay, module, playButton);
    }
}

export default function createAudioBufferSource() {
    let module = createModule("audio buffer source", false, true, true, false, sounds);
    let play = document.createElement("img");
    let moduleContent = document.getElementById(`${module.id}-content`)
    let select = document.getElementById(`${module.id}-footer-select`)

    play.src = "img/switch_off.svg";
    play.style.width = "40px";
    play.alt = "play";
    play.onclick = (event) => {
        playSelectedSound(module, event.target)
    };

    moduleContent.appendChild(play);

    addOpenFileButtonTo(select);

    // when select changes
    select.onchange = function (event) {
        // select get changed later when the file is open thus onchange 
        // get executed once more - we want to ignore this callout
        if (event.target.type == "file")
            return

        let clickedOption = event.target[this.selectedIndex]

        if (clickedOption.id == 'button') {
            console.log(this.id)
            openFileHandler(event.target[this.selectedIndex], module);
        } else {
            module.buffer = soundBuffer[this.selectedIndex];
        }
    };

    module.loop = false;
    module.buffer = soundBuffer[0];

    if (this.event)
        this.event.preventDefault();

    return module;
}