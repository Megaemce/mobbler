import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

function gotStream(stream) {
    this.audioNode = audioContext.createMediaStreamSource(stream);
}
export default function createLiveInput(event) {
    let module = new Module("live input", false, false, false, undefined);

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (navigator.getUserMedia)
        navigator.getUserMedia(
            {
                audio: {
                    mandatory: {
                        googEchoCancellation: "false",
                        googAutoGainControl: "false",
                        googNoiseSuppression: "false",
                        googHighpassFilter: "false",
                    },
                    optional: [],
                },
            },
            gotStream.bind(module),
            () => {
                alert("Error getting audio");
            }
        );
    else return alert("Error: getUserMedia not supported!");

    let recordingImg = document.createElement("img");
    recordingImg.src = "./img/circle.svg";

    module.content.controllers.appendChild(recordingImg);
    module.isTransmitting = true;
    module.markAllLinkedCablesAs("active");

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();

    event.preventDefault();
}
