import { audioContext } from "../main.js";
import { addOpenFileButtonTo } from "./builders.js";

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

export function openFileHandler(fileButton, module) {
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
