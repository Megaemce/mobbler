import Module from "../classes/Module.js";
import { audioContext } from "../main.js";
import { openFileHandler } from "../helpers/loaders.js";

/* function used by audio buffer source's playButton to play the sound */
Module.prototype.playButtonHandler = function () {
    const module = this;
    const selectedBufferName = module.content.options.select.value;

    // switched from on to off so stop the sound
    if (module.isTransmitting === true) {
        module.stopSound();
    } else {
        module.isTransmitting = true;
        module.content.controllers.playButton.classList.add("switch-on");

        // remove old audioNode (if there is any)
        if (module.audioNode) {
            module.audioNode.stop(0);
            module.audioNode.disconnect();
            module.audioNode = undefined;
        }

        //  create a new BufferSource with selected buffer and play it
        module.audioNode = audioContext.createBufferSource();
        module.audioNode.loop = module.content.options.looper.checkbox.checked;
        module.audioNode.buffer = audioContext.nameSoundBuffer[selectedBufferName];
        module.audioNode.playbackRate.value = module.content.controllers.playbackRate.slider.value;

        // send sound to all connected modules/modules' parameters
        module.outcomingCables.forEach((cable) => {
            cable.makeActive();
            if (cable.inputName === "input" && cable.destination.audioNode) module.connectToModule(cable.destination);
            if (cable.inputName !== "input") module.connectToParameter(cable.destination, cable.inputName);
        });

        module.audioNode.start(audioContext.currentTime);

        // if there is loop disabled stop the sound after delay
        if (module.audioNode.loop === false) {
            const delay = Math.floor(module.buffer.duration * 1000) + 1;

            module.audioNode.stopTimer = window.setTimeout(() => {
                module.stopSound();
            }, delay);
        }
    }
};
/* function used by playButtonHandler function to stop the sound */
Module.prototype.stopSound = function () {
    const module = this;

    module.isTransmitting = false;
    module.audioNode.stop(0);

    // clear stopTimer parameter (if there is any)
    if (module.audioNode.stopTimer) {
        window.clearTimeout(module.audioNode.stopTimer);
        module.audioNode.stopTimer = undefined;
    }

    module.content.controllers.playButton.classList.remove("switch-on");

    // if loop is enabled sound will play even with switch-off thus kill it with fire
    if (module.audioNode.loop === true) {
        module.audioNode.loop = false;
        module.content.options.looper.checkbox.checked = false;
    }

    module.markAllLinkedCablesAs("deactive");
};

export default function audioSource(event, initalLoop, initalBufferName, initalPlaybackRate) {
    const loop = initalLoop === undefined ? false : Boolean(initalLoop);
    const soundNames = Object.keys(audioContext.nameSoundBuffer);
    const bufferName = String(initalBufferName || soundNames[5]);
    const playbackRate = parseFloat(initalPlaybackRate || 1);
    const switchDiv = document.createElement("div");
    const playButton = document.createElement("button");
    const playbackRateInfo = "Increase the playback rate squeeze the sound wave into a smaller time window, which increases its frequency";

    const module = new Module("audio source", false, true, false, soundNames);

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

    module.content.options.select.value = bufferName;

    // when select changes
    module.content.options.select.onchange = function (event) {
        // when new option is added (eg. after new file loaded) this onchange event get trigger too
        // srcElement.id is only defined when if it was triggered by file button (eg. loading file)
        if (!event.srcElement.id) {
            // when selected option is an file button start openFileHandler
            if (this[this.selectedIndex].id === "file button") {
                // add hooker to the fileButton and then start it by click event
                module.content.options.select.fileButton.input.onchange = () => {
                    openFileHandler(module, "sound");
                };
                module.content.options.select.fileButton.input.click();
            } else {
                module.buffer = audioContext.nameSoundBuffer[this.value];
            }
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
