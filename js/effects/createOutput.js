import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createOutput(event) {
    let module = new Module("output", true, false, false, undefined);
    let speakerImg = document.createElement("img");

    speakerImg.src = "./img/ico-speaker.png";
    module.content.controllers.appendChild(speakerImg);

    module.audioNode = audioContext.destination;

    module.onDeletion = () => {
        document.getElementById("output").style.visibility = "visible";
    };

    event.preventDefault();
}
