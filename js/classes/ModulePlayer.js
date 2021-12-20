import Module from "./Module.js";
import { audioContext, modules } from "../main.js";

export default class Player extends Module {
    constructor(name, listElement, list, looper, looperValue) {
        super(name, false, looper, false, list);
        this.type = name; // keep type in case user will change the title thus the name
        this.looperValue = looperValue === undefined ? false : Boolean(looperValue);
        this.buildStucture(listElement);
    }
    /* build play button HTML and all its logic */
    buildStucture(type) {
        const module = this;
        const switchDiv = document.createElement("div");
        const playButton = document.createElement("button");

        switchDiv.appendChild(document.createTextNode("ON"));
        switchDiv.appendChild(playButton);
        switchDiv.appendChild(document.createTextNode("OFF"));
        switchDiv.classList.add("switch");

        module.content.controllers.appendChild(switchDiv);

        module.content.options.select.value = type;

        if (module.looperValue) {
            module.content.options.looper.checkbox.checked = module.looperValue;
        }

        playButton.alt = "play";
        playButton.onclick = () => {
            module.isTransmitting ? module.stopSound() : module.playSound();
        };

        module.footer.classList.add("move-by-switch");

        module.playButton = playButton;
    }
    /* play sound on this module */
    playSound() {
        const module = this;

        module.isTransmitting = true;
        module.playButton.classList.add("switch-on");

        // stop old audioNode (if there is any)
        if (module.audioNode) {
            module.audioNode.stop(0);
            module.audioNode.disconnect();
            // clear timer so the last track doesn't stop the new one
            window.clearTimeout(module.audioNode.stopTimer);
        }

        //  create a new audio buffer source with selected buffer
        if (module.type === "audio source") {
            const loop = Boolean(module.content.options.looper.checkbox.checked);
            const bufferName = audioContext.nameSoundBuffer[module.content.options.select.value];
            const playbackRate = parseFloat(module.content.controllers.playbackRate.slider.value);
            const bufferDuration = Math.floor(bufferName.duration * 1000) + 1;

            module.audioNode = new AudioBufferSourceNode(audioContext, {
                loop: loop,
                buffer: bufferName,
                playbackRate: playbackRate,
            });

            // if there is loop disabled stop the sound after delay
            if (module.audioNode.loop === false) {
                module.audioNode.stopTimer = window.setTimeout(() => {
                    module.stopSound();
                }, bufferDuration);
            }
        }

        // start playing
        module.audioNode.start(0);

        // send sound to all connected modules/modules' parameters
        module.outcomingCables.forEach((cable) => {
            const cableDestination = modules[cable.destinationID];
            cable.makeActive();
            if (cableDestination === undefined) return;
            if (cable.inputName === "input" && cableDestination.audioNode) module.connectToModule(cableDestination);
            if (cable.inputName !== "input") module.connectToParameter(cableDestination, cable.inputName);
        });
    }
    /* stop sound on this module */
    stopSound() {
        const module = this;

        module.isTransmitting = false;

        module.playButton.classList.remove("switch-on");

        module.audioNode.stop(0);

        // clear stopTimer parameter (if there is any)
        if (module.audioNode.stopTimer) {
            window.clearTimeout(module.audioNode.stopTimer);
            module.audioNode.stopTimer = undefined;
        } else {
            module.audioNode.disconnect();
        }

        module.markAllLinkedCablesAs("deactive");
    }
}
