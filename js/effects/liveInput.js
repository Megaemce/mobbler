import Module from "../classes/Module.js";
import { audioContext } from "../main.js";
import { displayAlertOnElement } from "../helpers/builders.js";

function gotStream(stream) {
    this.audioNode = audioContext.createMediaStreamSource(stream);
}
export default function liveInput(event) {
    const mic = document.createTextNode("🎤");
    const span = document.createElement("span");
    const module = new Module("live input", false, false, false, undefined);

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

    module.isTransmitting = true;
    module.markAllLinkedCablesAs("active");

    span.appendChild(mic);
    span.classList = "microphone";
    module.content.appendChild(span);

    // only one liveInput possible per project
    const liveInputButton = document.getElementById("liveInput");
    liveInputButton.style.cursor = "not-allowed";
    liveInputButton.removeEventListener("mousedown", liveInput);
    liveInputButton.onmouseover = () => {
        displayAlertOnElement("Only one live input per project", liveInputButton);
    };

    module.onDeletion = () => {
        liveInputButton.style.cursor = "pointer";
        liveInputButton.onmouseover = undefined;
        liveInputButton.addEventListener("mousedown", liveInput);
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
