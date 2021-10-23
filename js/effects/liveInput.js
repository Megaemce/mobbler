import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

function gotStream(stream) {
    this.audioNode = audioContext.createMediaStreamSource(stream);
}
export default function liveInput(event) {
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

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
