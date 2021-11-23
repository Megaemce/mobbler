import Module from "../classes/Module.js";
import { audioContext } from "../main.js";
import { openFileHandler } from "../helpers/loaders.js";

/* function used by audio buffer source's playButton to play the sound */
Module.prototype.playButtonHandler = function () {
    let selectedBufferName = this.content.options.select.value;

    // switched from on to off so stop the sound
    if (this.isTransmitting === true) {
        this.stopSound();
    } else {
        this.isTransmitting = true;
        this.content.controllers.playButton.classList.add("switch-on");

        //  create a new BufferSource with selected buffer and play it
        this.audioNode = audioContext.createBufferSource();
        this.audioNode.loop = this.content.options.looper.checkbox.checked;
        this.audioNode.buffer = audioContext.nameSoundBuffer[selectedBufferName];
        this.audioNode.playbackRate.value = this.content.controllers.playbackRate.slider.value;

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

    // remove old audioNode (if there is any)
    if (this.audioNode) {
        this.markAllLinkedCablesAs("deactive");
        this.audioNode.disconnect();
    }

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
};

export default function audioSource(event, initalLoop, initalBufferName, initalPlaybackRate) {
    const loop = initalLoop || false;
    const bufferName = initalBufferName || "guitar.ogg";
    const playbackRate = initalPlaybackRate || 1;
    const playbackRateInfo = "Increase the playback rate squeeze the sound wave into a smaller time window, which increases its frequency";
    const soundNames = Object.keys(audioContext.nameSoundBuffer);

    let playButton = document.createElement("button");
    let switchDiv = document.createElement("div");

    let module = new Module("audio source", false, true, false, soundNames);

    module.createSlider("playback Rate", playbackRate, 0.1, 5, 0.1, "x", false, playbackRateInfo);

    // set module with inital values
    module.loop = loop;
    module.buffer = audioContext.nameSoundBuffer[bufferName];

    // add play button and it's handler
    switchDiv.appendChild(document.createTextNode("ON"));
    switchDiv.appendChild(playButton);
    switchDiv.appendChild(document.createTextNode("OFF"));
    switchDiv.classList.add("switch");

    module.content.controllers.appendChild(switchDiv);
    module.content.controllers.playButton = playButton;
    module.content.controllers.playButton.onclick = () => {
        module.playButtonHandler();
    };

    // after this openFile will be accessible via module.content.options.select.fileButton
    module.addOpenFileTo(module.content.options.select);

    // add openfilehandler to hidden input button
    module.content.options.select.fileButton.input.onchange = () => {
        openFileHandler(module);
    };

    module.content.options.select.value = bufferName;

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
