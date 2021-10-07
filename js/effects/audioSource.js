import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

/* function used by audio buffer source's playButton to play the sound */
Module.prototype.playButtonHandler = function () {
    let selectedBufferName = this.content.options.select.value;

    // switched from on to off so stop the sound
    if (this.isTransmitting === true) {
        this.stopSound();
    } else {
        this.isTransmitting = true;
        this.content.controllers.playButton.classList.add("switch-on");

        // remove old audioNode (if there is any)
        if (this.audioNode) {
            this.audioNode.stop(0);
            this.audioNode.disconnect();
            this.audioNode = undefined;
        }

        //  create a new BufferSource with selected buffer and play it
        this.audioNode = audioContext.createBufferSource();
        this.audioNode.loop = this.content.options.looper.checkbox.checked;
        this.audioNode.buffer = audioContext.nameSoundBuffer[selectedBufferName];

        // send sound to all connected modules/modules' parameters
        this.outcomingCables.forEach((cable) => {
            if (cable.destination.audioNode || cable.destination.audioNodes) {
                if (cable.inputType === "input") this.connectToModule(cable.destination);
                if (cable.inputType !== "input") this.connectToParameter(cable.destination, cable.inputType);
            }
        });

        this.audioNode.start(audioContext.currentTime);

        // if there is loop disabled stop the sound after delay
        if (this.audioNode.loop === false) {
            let delay = Math.floor(this.buffer.duration * 1000) + 1;

            this.audioNode.stopTimer = window.setTimeout(() => {
                this.stopSound();
            }, delay);
        }
    }
};
/* function used by playButtonHandler function to stop the sound */
Module.prototype.stopSound = function () {
    this.isTransmitting = false;
    this.audioNode.stop(0);

    // clear stopTimer parameter (if there is any)
    if (this.audioNode.stopTimer) {
        window.clearTimeout(this.audioNode.stopTimer);
        this.audioNode.stopTimer = undefined;
    }

    this.content.controllers.playButton.classList.remove("switch-on");

    // if loop is enabled sound will play even with switch-off thus kill it with fire
    if (this.audioNode.loop === true) {
        this.audioNode.loop = false;
        this.content.options.looper.checkbox.checked = false;
    }

    this.markAllLinkedCablesAs("deactive");
};

export default function audioSource(event, loop, bufferName) {
    const initalLoop = loop || false;
    const initalBufferName = bufferName || "guitar.ogg";
    const soundNames = Object.keys(audioContext.nameSoundBuffer);

    let module = new Module("audio source", false, true, false, soundNames);
    let playButton = document.createElement("div");

    // set module with inital values
    module.loop = initalLoop;
    module.buffer = audioContext.nameSoundBuffer[initalBufferName];

    // add play button and it's handler
    module.content.controllers.appendChild(playButton);
    module.content.controllers.playButton = playButton;
    module.content.controllers.playButton.classList.add("switch");
    module.content.controllers.playButton.onclick = () => {
        module.playButtonHandler();
    };

    // after this openFile will be accessible via module.content.options.select.fileButton
    module.addOpenFileTo(module.content.options.select);

    module.content.options.select.value = initalBufferName;

    // when select changes
    module.content.options.select.onchange = function () {
        // when selected option is an file button start openFileHandler
        if (this[this.selectedIndex].id === "file button") {
            module.content.options.select.fileButton.input.click();
        } else {
            module.buffer = audioContext.nameSoundBuffer[this.value];
        }
        // if something is playing stop it
        module.audioNode && module.stopSound();
    };

    // when changing looper settings reset the sound
    module.content.options.looper.checkbox.onchange = function () {
        if (module.audioNode) module.audioNode.loop = this.checked;
    };

    module.footer.classList.add("move-by-switch");

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
