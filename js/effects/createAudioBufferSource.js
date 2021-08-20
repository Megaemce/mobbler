import Module from "../classes/Module.js";
import audioContext from "../main.js";
import Cable from "../classes/Cable.js";

function addOpenFileButtonTo(element) {
    let input = document.createElement("input");
    let button = document.createElement("button");
    let option = document.createElement("option");

    input.style = "display: none;";
    input.type = "file";
    input.id = "file-input";

    button.innerText = "Open file...";
    button.id = "button";

    option.id = "file button";
    option.appendChild(button);
    option.appendChild(input);

    element.appendChild(option);
}

function openFileHandler(fileButton, module) {
    let input = document.getElementById("file-input");
    // when file is choosen
    input.onchange = function () {
        let fileLoaded = this.files[0];
        let reader = new FileReader();
        // when file is loaded as array buffer
        reader.onload = function () {
            let fileAsArrayBuffer = this.result;
            // when file is decoded as an audio
            audioContext.decodeAudioData(fileAsArrayBuffer).then(function (decodedData) {
                // store it as an module buffer
                module.buffer = decodedData;
                audioContext.nameSoundBuffer[fileLoaded.name] = decodedData;
            });
        };
        reader.onerror = () => {
            alert("Error: " + reader.error);
        };
        reader.readAsArrayBuffer(fileLoaded);

        fileButton.innerHTML = fileLoaded.name;
        fileButton.removeAttribute("id"); // not button anymore
        addOpenFileButtonTo(fileButton.parentNode);
    };
    input.click();
}

function stopSound(module) {
    let playButton = module.content.controllers.playButton;

    playButton.isPlaying = false;
    playButton.classList.remove("switch-on");
    module.head.diode.className = "diode";

    if (module.audioNode.stopTimer) {
        window.clearTimeout(module.audioNode.stopTimer);
        module.audioNode.stopTimer = 0;
    }
    // if loop is enabled sound will play even with switch-off thus kill it with fire
    if (module.audioNode.loop) {
        module.audioNode.loop = false;
        module.content.options.looper.checkbox.checked = false;
    }
}

function playSelectedSound(module) {
    let loop = module.content.options.looper.checkbox.checked;
    let selectedBufferName = module.content.options.select.value;
    let playButton = module.content.controllers.playButton;

    if (playButton.isPlaying) stopSound(module, playButton);
    else {
        playButton.isPlaying = true;
        module.head.diode.className = "diode diode-on";
        playButton.classList.add("switch-on");

        // if there's already a note playing, cut it off
        if (module.audioNode) {
            module.audioNode.stop(0);
            module.audioNode.disconnect();
            module.audioNode = undefined;
        }

        // create a new BufferSource and connect it
        module.audioNode = audioContext.createBufferSource();
        module.audioNode.loop = loop;
        module.audioNode.buffer = audioContext.nameSoundBuffer[selectedBufferName];

        // play sound on all connected output
        if (module.outcomingCables) {
            module.outcomingCables.forEach(function (cable) {
                // it might be that someone click on the loop button when the module is not connected
                // thus checking audioNode from loose (not connected) cable
                cable.destination && module.audioNode.connect(cable.destination.audioNode);
            });
        }
        module.audioNode.start(audioContext.currentTime);

        if (!module.audioNode.loop) {
            let delay = Math.floor(module.buffer.duration * 1000) + 1;
            module.audioNode.stopTimer = window.setTimeout(stopSound, delay, module, playButton);
        }
    }
}

export default function createAudioBufferSource(event, initalLoop, initalBufferName) {
    let soundNames = Object.keys(audioContext.nameSoundBuffer);
    let module = new Module("audio buffer source", false, true, false, soundNames);
    let playButton = document.createElement("div");

    playButton.classList.add("switch");
    playButton.onclick = function () {
        playSelectedSound(module);
    };

    module.content.controllers.appendChild(playButton);
    module.content.controllers.playButton = playButton;

    module.footer.classList.add("move-by-switch");

    addOpenFileButtonTo(module.content.options.select);

    // when select changes
    module.content.options.select.onchange = function () {
        // select get changed later when the file is open thus onchange
        // get executed once more - we want to ignore this callout
        if (this.type == "file") return;

        let clickedOption = this[this.selectedIndex];

        if (clickedOption.id == "file button") {
            openFileHandler(this[this.selectedIndex], module);
        } else {
            module.buffer = audioContext.nameSoundBuffer[this.value];
        }
    };

    // when changing looper settings reset the sound
    module.content.options.looper.checkbox.onchange = function () {
        playSelectedSound(module);
    };

    module.loop = initalLoop;
    module.buffer = audioContext.nameSoundBuffer[initalBufferName];

    new Cable(module); // create first inital cable linked to module

    event.preventDefault();
}
