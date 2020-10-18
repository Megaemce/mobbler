import createModule from './createModule.js';
import createModuleSlider from './createModuleSlider.js';
import {
    audioContext
} from './main.js';

let oscTypes = ["sine", "square", "sawtooth", "triangle"];
const freqMin = 0.1;
const freqMax = 2000;
const freqInit = 440;
const freqSteps = 0.01;
const freqUnit = "Hz"
const detuneMin = -1200;
const detuneMax = 1200;
const detuneInit = 0;
const detuneSteps = 1;
const detuneUnit = "cents";

export default function createOscillator() {
    let play = document.createElement("img");
    let module = createModule("oscillator", false, true, false, false, oscTypes);
    let select = document.getElementById(`${module.id}-footer-select`)
    let diode = document.getElementById(`${module.id}-head-diode`)
    let moduleContent = document.getElementById(`${module.id}-content`)

    createModuleSlider(module, "frequency", freqInit, freqMin, freqMax, freqSteps, freqUnit, true);
    createModuleSlider(module, "detune", detuneInit, detuneMin, detuneMax, detuneSteps, detuneUnit, false);

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
                if (module.outputConnections) {
                    module.outputConnections.forEach(function (connection) {
                        module.audioNode.disconnect(connection.destination.audioNode);
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

            if (module.outputConnections) {
                module.outputConnections.forEach(function (connection) {
                    module.audioNode.connect(connection.destination.audioNode);
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

    if (this.event)
        this.event.preventDefault();
}