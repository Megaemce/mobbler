import createModule from '../structure/createModule.js';
import createModuleSlider from '../structure/createModuleSlider.js';
import {
    audioContext
} from '../main.js';

export default function createOscillator(event, initalFrequency, initalDetune) {
    const oscTypes = ["sine", "square", "sawtooth", "triangle"];

    let play = document.createElement("img");
    let module = createModule("oscillator", false, true, false, false, oscTypes);
    let select = document.getElementById(`${module.id}-footer-select`)
    let diode = document.getElementById(`${module.id}-head-diode`)
    let moduleContent = document.getElementById(`${module.id}-content`)

    createModuleSlider(module, "frequency", initalFrequency, 0.1, 2000, 0.01, "Hz", true);
    createModuleSlider(module, "detune", initalDetune, -1200, 1200, 1, "cents", false);

    play.src = "img/switch_off.svg";
    play.alt = "play";
    play.onclick = function () {
        let frequency = document.getElementById(`${module.id}-content-frequency-info-value`).textContent;
        let detune = document.getElementById(`${module.id}-content-detune-input`).value;
        let type = oscTypes[document.getElementById(`${module.id}-footer-select`).selectedIndex];
        let playButton = this;

        if (playButton.isPlaying) {
            //stop
            diode.className = "diode";
            playButton.isPlaying = false;
            playButton.src = "img/switch_off.svg";
            // if there is a sound installed
            if (module.audioNode) {
                if (module.outcomingCables) {
                    module.outcomingCables.forEach(function (cable) {
                        module.audioNode.disconnect(cable.destination.audioNode);
                    });
                }
                module.audioNode = null;
            }

        } else {
            diode.className = "diode diode-on";
            playButton.isPlaying = true;
            playButton.src = "img/switch_on.svg";

            module.audioNode = audioContext.createOscillator();
            module.audioNode.frequency.value = frequency;
            module.audioNode.detune.value = detune;
            module.audioNode.type = type;

            if (module.outcomingCables) {
                module.outcomingCables.forEach(function (cable) {
                    module.audioNode.connect(cable.destination.audioNode);
                });
            }
            module.audioNode.start(0);
        }
    }

    select.onchange = function () {
        // if we have a playing oscillator, go ahead and switch it live
        if (module.audioNode)
            module.audioNode.type = oscTypes[this.selectedIndex];
    };


    moduleContent.appendChild(play);

    event.preventDefault();
}