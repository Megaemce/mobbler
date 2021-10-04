import Cable from "../classes/Cable.js";
import Module from "../classes/Module.js";
import { audioContext, cables } from "../main.js";

export default function createOscillator(initalFrequency, initalDetune) {
    const frequecy = initalFrequency || 440;
    const detune = initalDetune || 0;
    const oscTypes = ["sine", "square", "sawtooth", "triangle"];
    const frequencyInfo = "Number of complete cycles a waveform makes in a second";
    const detuneInfo = "Determine how much signal will be played out of tune";

    let playButton = document.createElement("div");
    let module = new Module("oscillator", false, false, false, oscTypes);

    module.createSlider("frequency", frequecy, 0.1, 2000, 0.01, "Hz", true, frequencyInfo);
    module.createSlider("detune", detune, -1200, 1200, 1, "cents", false, detuneInfo);

    playButton.classList.add("switch");
    playButton.alt = "play";
    playButton.onclick = function () {
        let frequency = module.content.controllers.frequency.value.innerText; //.value is a pointer not returner
        let detune = module.content.controllers.detune.slider.value;
        let type = module.content.options.select.value;
        let playButton = this;

        if (module.isTransmitting) {
            //stop
            module.isTransmitting = false;
            playButton.classList.remove("switch-on");

            // if there is a sound installed
            if (module.audioNode) {
                module.audioNode.disconnect();
                module.audioNode = undefined;
            }

            module.markAllLinkedCablesAs("deactive");
        } else {
            module.isTransmitting = true;
            playButton.classList.add("switch-on");

            module.audioNode = audioContext.createOscillator();
            module.audioNode.frequency.value = frequency;
            module.audioNode.detune.value = detune;
            module.audioNode.type = type;

            module.outcomingCables.forEach((cable) => {
                if (cable.destination.audioNode || cable.destination.audioNodes) {
                    if (cable.inputType === "input") module.connectToModule(cable.destination);
                    if (cable.inputType !== "input") module.connectToParameter(cable.destination, cable.inputType);
                }
            });

            module.audioNode.start(0);
        }
    };

    module.footer.classList.add("move-by-switch");

    module.content.options.select.onchange = function () {
        // if we have a playing oscillator, go ahead and switch it live
        if (module.audioNode) module.audioNode.type = this.value;
    };

    module.content.controllers.appendChild(playButton);

    // structure needs to be fully build before. GetBoundingClientRect related.
    module.addInitalCable();
}
