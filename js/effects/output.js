import Module from "../classes/Module.js";
import { audioContext } from "../main.js";
import { displayAlertOnElement, addModuleToMixer, buildMixer } from "../helpers/builders.js";

export default function output(event) {
    const speakerImg = document.createElement("img");

    const module = new Module("output", true, false, false, undefined);

    speakerImg.src = "./img/speaker.svg";
    module.content.controllers.appendChild(speakerImg);

    module.audioNode = audioContext.destination;

    // only one output possible per project
    const outputButton = document.getElementById("output");
    outputButton.style.cursor = "not-allowed";
    outputButton.onmousedown = undefined;
    outputButton.onmouseover = () => {
        displayAlertOnElement("Only one output per project", outputButton);
    };

    // // add mixer to the body
    // buildMixer();

    module.onDeletion = () => {
        // const mixer = document.getElementById("mixer-controllers");
        // mixer.classList.remove("show");

        outputButton.style.cursor = "pointer";
        outputButton.onmouseover = undefined;
        outputButton.onmousedown = output;
    };

    // // add new channel mixer to the mixer (if it's not already there)
    // module.onInputConnected = (source) => {
    //     const mixer = document.getElementById("mixer-controllers");

    //     if (!mixer[source.id]) {
    //         addModuleToMixer(source);
    //     }
    //     mixer.classList.remove("nothing");
    // };

    // module.onDisconnectInput = (source) => {
    //     const mixer = document.getElementById("mixer-controllers");

    //     mixer.removeChild(mixer[source.id]);
    //     if (module.inputCount === 0) {
    //         mixer.classList.add("nothing");
    //     }
    // };

    return module;
}
