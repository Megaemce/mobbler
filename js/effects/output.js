import Module from "../classes/Module.js";
import { audioContext } from "../main.js";
import { displayAlertOnElement } from "../helpers/builders.js";

export default function output(event) {
    const speakerImg = document.createElement("img");
    const module = new Module("output", true, false, false, undefined);

    speakerImg.src = "./img/speaker.svg";
    module.content.controllers.appendChild(speakerImg);

    module.audioNode = audioContext.destination;

    // only one output possible per project
    const outputButton = document.getElementById("output");
    outputButton.style.cursor = "not-allowed";
    outputButton.removeEventListener("mousedown", output);
    outputButton.onmouseover = () => {
        displayAlertOnElement("Only one output per project", outputButton);
    };

    module.onDeletion = () => {
        outputButton.style.cursor = "pointer";
        outputButton.onmouseover = undefined;
        outputButton.addEventListener("mousedown", output);
    };
}
