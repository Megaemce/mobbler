import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function oscillator(event, initalFrequency, initalDetune) {
    const detune = parseFloat(initalDetune || 0);
    const frequecy = parseFloat(initalFrequency || 440);
    const oscTypes = ["sine", "square", "sawtooth", "triangle"];
    const switchDiv = document.createElement("div");
    const playButton = document.createElement("button");
    const detuneInfo = "Determine how much signal will be played out of tune";
    const frequencyInfo = "Number of complete cycles a waveform makes in a second";

    const module = new Module("oscillator", false, false, false, oscTypes);

    module.createSlider("frequency", frequecy, 0.1, 2000, 0.01, "Hz", true, frequencyInfo);
    module.createSlider("detune", detune, -1200, 1200, 1, "cents", false, detuneInfo);

    playButton.alt = "play";
    playButton.onclick = function () {
        const frequency = parseFloat(module.content.controllers.frequency.value.innerText); //.value is a pointer not returner
        const detune = parseFloat(module.content.controllers.detune.slider.value);
        const type = String(module.content.options.select.value);
        const playButton = this;

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

            module.audioNode = new OscillatorNode(audioContext, {
                type: type,
                detune: detune,
                frequency: frequency,
            });
            module.audioNode.start(0);

            module.outcomingCables.forEach((cable) => {
                cable.makeActive();
                if (cable.inputName === "input" && cable.destination.audioNode) module.connectToModule(cable.destination);
                if (cable.inputName !== "input") module.connectToParameter(cable.destination, cable.inputName);
            });
        }
    };

    module.footer.classList.add("move-by-switch");

    module.content.options.select.onchange = function () {
        // if we have a playing oscillator, go ahead and switch it live
        if (module.audioNode) module.audioNode.type = this.value;
    };

    switchDiv.appendChild(document.createTextNode("ON"));
    switchDiv.appendChild(playButton);
    switchDiv.appendChild(document.createTextNode("OFF"));
    switchDiv.classList.add("switch");

    module.content.controllers.appendChild(switchDiv);

    // structure needs to be fully build before. GetBoundingClientRect related.
    module.addInitalCable();
}
