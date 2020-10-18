import createModule from './createModule.js';
import {
    audioContext
} from './main.js';


function gotStream(stream) {
    this.audioNode = audioContext.createMediaStreamSource(stream);
}
export default function createLiveInput() {
    let module = createModule("live input", false, true, false, false, null);
    let content = document.getElementById(`${module.id}-content`)

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (navigator.getUserMedia)
        navigator.getUserMedia({
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream.bind(module), () => {
            alert('Error getting audio');
        });
    else
        return (alert("Error: getUserMedia not supported!"));

    let recordingImg = document.createElement("img")
    recordingImg.src = "./img/circle.svg"

    content.appendChild(recordingImg)

    if (this.event)
        this.event.preventDefault();
}