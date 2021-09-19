import Module from "../classes/Module.js";
import { audioContext } from "../main.js";
import { openFileHandler } from "../helpers/loaders.js";
import { addOpenFileButtonTo } from "../helpers/builders.js";

export default function createAudioBufferSource(event, initalLoop, initalBufferName) {
    let soundNames = Object.keys(audioContext.nameSoundBuffer);
    let module = new Module("audio buffer source", false, true, false, soundNames);
    let playButton = document.createElement("div");

    playButton.classList.add("switch");
    playButton.onclick = () => {
        module.playButtonHandler();
    };

    module.content.controllers.appendChild(playButton);
    module.content.controllers.playButton = playButton;

    module.footer.classList.add("move-by-switch");

    addOpenFileButtonTo(module.content.options.select);

    // when select changes
    module.content.options.select.onchange = function () {
        // select get changed later when the file is open thus onchange
        // get executed once more - we want to ignore this callout
        if (this.type == "file") return;

        let clickedOption = this[this.selectedIndex];

        if (clickedOption.id == "file button") {
            openFileHandler(this[this.selectedIndex], module);
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

    module.loop = initalLoop;
    module.buffer = audioContext.nameSoundBuffer[initalBufferName];

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();

    event.preventDefault();
}
