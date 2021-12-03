import Player from "../classes/ModulePlayer.js";
import { audioContext } from "../main.js";
import { openFileHandler } from "../helpers/loaders.js";

export default function audioSource(event, initalLoop, initalBufferName, initalPlaybackRate) {
    const soundNames = Object.keys(audioContext.nameSoundBuffer);
    const bufferName = initalBufferName === undefined ? soundNames[0] : initalBufferName;
    const looperValue = initalLoop === undefined ? false : Boolean(initalLoop);
    const playbackRate = parseFloat(initalPlaybackRate || 1);
    const playbackRateInfo = "Increase the playback rate squeeze the sound wave into a smaller time window, which increases its frequency";

    const module = new Player("audio source", bufferName, soundNames, true, looperValue);

    module.createSlider("playback Rate", playbackRate, 0.1, 5, 0.1, "x", false, playbackRateInfo);

    // after this openFile will be accessible via module.content.options.select.fileButton
    module.addOpenFileTo(module.content.options.select);

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
                // stop the sound as select.value is still "open file..." thus causing issue in loading audio buffer
                module.stopSound();
            } else {
                // if something is playing stop it and play the new one
                module.isTransmitting && module.playSound();
            }
        }
    };

    // when changing looper settings kill or loop the buffer
    module.content.options.looper.checkbox.onchange = function () {
        if (module.audioNode) {
            module.audioNode.loop = this.checked;
            if (this.checked === true) {
                window.clearTimeout(module.audioNode.stopTimer);
            }
            if (this.checked === false) {
                const currentBuffer = audioContext.nameSoundBuffer[module.content.options.select.value];
                const delay = Math.floor(currentBuffer.duration * 1000) + 1;

                module.audioNode.stopTimer = window.setTimeout(() => {
                    module.stopSound();
                }, delay);
            }
        }
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
