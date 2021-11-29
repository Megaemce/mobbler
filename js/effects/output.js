import Module from "../classes/Module.js";
import { displayAlertOnElement } from "../helpers/builders.js";
import { audioContext } from "../main.js";

export default function output(event) {
    const speakerImg = document.createElement("img");
    const module = new Module("output", true, false, false, undefined);

    speakerImg.src = "./img/speaker.svg";
    module.content.controllers.appendChild(speakerImg);

    module.audioNode = audioContext.destination;

    // only one output possible thus hide output button
    const outputSubMenuButton = document.getElementById("output");
    outputSubMenuButton.style.cursor = "not-allowed";
    outputSubMenuButton.onmouseover = () => {
        displayAlertOnElement("Only one output per project", outputSubMenuButton);
    };

    module.onDeletion = () => {
        outputSubMenuButton.style.cursor = "pointer";
    };
}
