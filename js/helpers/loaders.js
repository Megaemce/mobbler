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

export function openFileHandler(module) {
    let reader = new FileReader();
    let select = module.content.options.select;
    let fileButton = module.content.options.select.fileButton;
    let fileLoaded = module.content.options.select.fileButton.input.files[0];

    // when file is loaded as array buffer
    reader.onload = function () {
        let fileAsArrayBuffer = this.result;
        // when file is decoded as an audio
        audioContext
            .decodeAudioData(fileAsArrayBuffer)
            .then(function (decodedData) {
                // store it as an module buffer
                module.buffer = decodedData;
                audioContext.nameSoundBuffer[fileLoaded.name] = decodedData;

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
