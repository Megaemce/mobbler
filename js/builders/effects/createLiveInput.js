import createModule from "../createModuleObject.js";
import audioContext from "../../main.js";
import Cable from "../../classes/Cable.js";

function gotStream(stream) {
    this.audioNode = audioContext.createMediaStreamSource(stream);
}
export default function createLiveInput(event) {
    let module = createModule("live input", false, false, false, undefined);

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

    new Cable(module); // create first inital cable linked to module

    event.preventDefault();
}
