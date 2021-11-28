import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function output(event) {
    const speakerImg = document.createElement("img");
    const module = new Module("output", true, false, false, undefined);

    speakerImg.src = "./img/speaker.svg";
    module.content.controllers.appendChild(speakerImg);

    module.audioNode = audioContext.destination;

    // only one output possible thus hide output button
    document.getElementById("output").style.display = "none";

    module.onDeletion = () => {
        document.getElementById("output").style.display = "block";
    };
}
