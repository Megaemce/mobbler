import { audioContext } from "../main.js";
import { addOpenFileButtonTo, displayAlertOnElement } from "./builders.js";

// adding sounds to the audioContext
export function loadFilesIntoAudioContext(soundArray, isSound) {
    let nameBufferDictonary = new Object();
    soundArray.forEach((fileName) => {
        let soundRequest = new XMLHttpRequest();
        soundRequest.open("GET", `./sounds/${fileName}`, true);
        soundRequest.responseType = "arraybuffer";
        soundRequest.onload = function () {
            audioContext.decodeAudioData(soundRequest.response, function (buffer) {
                nameBufferDictonary[fileName] = buffer;
            });
        };
        soundRequest.send();
    });
    isSound ? (audioContext.nameSoundBuffer = nameBufferDictonary) : (audioContext.nameIRBuffer = nameBufferDictonary);
}

export function openFileHandler(module, type) {
    const reader = new FileReader();
    const select = module.content.options.select;
    const fileButton = module.content.options.select.fileButton;
    const fileLoaded = module.content.options.select.fileButton.input.files[0];

    // when file is loaded as array buffer
    reader.onload = function () {
        const fileAsArrayBuffer = this.result;
        // when file is decoded as an audio
        audioContext
            .decodeAudioData(fileAsArrayBuffer)
            .then(function (decodedData) {
                // store it as an module buffer
                module.buffer = decodedData;
                // load into buffer array or IR
                if (type === "sound") audioContext.nameSoundBuffer[fileLoaded.name] = decodedData;
                if (type === "ir") audioContext.nameIRBuffer[fileLoaded.name] = decodedData;

                // in reverb new file need to be played instantly
                if (module.name === "reverb") module.audioNode.convolerNode.buffer = audioContext.nameIRBuffer[fileLoaded.name];

                fileButton.innerHTML = fileLoaded.name;
                fileButton.removeAttribute("id"); // not button anymore

                // add another "open file..." button
                addOpenFileButtonTo(select);
            })
            .catch((error) => {
                select.value = select.options[0].text;
                displayAlertOnElement("Unable to decode audio data", module.div);
            });
    };
    reader.onerror = () => {
        alert("Error: " + reader.error);
    };

    reader.readAsArrayBuffer(fileLoaded);
}
