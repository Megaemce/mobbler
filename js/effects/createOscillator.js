import Module from "../classes/Module.js";
import { audioContext, cables } from "../main.js";

export default function createOscillator(event, initalFrequency, initalDetune) {
    const oscTypes = ["sine", "square", "sawtooth", "triangle"];

    let playButton = document.createElement("div");
    let module = new Module("oscillator", false, false, false, oscTypes);

    module.createModuleSlider("frequency", initalFrequency, 0.1, 2000, 0.01, "Hz", true);
    module.createModuleSlider("detune", initalDetune, -1200, 1200, 1, "cents", false);

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

            // all outocoming cables should be deactived now
            module.outcomingCables.forEach((cable) => {
                cable.makeDeactive();
            });
        } else {
            module.isTransmitting = true;
            playButton.classList.add("switch-on");

            module.audioNode = audioContext.createOscillator();
            module.audioNode.frequency.value = frequency;
            module.audioNode.detune.value = detune;
            module.audioNode.type = type;

            module.outcomingCables.forEach((cable) => {
                cable.makeActive();
                if (cable.destination && cable.destination.audioNode) {
                    if (cable.type === "input") {
                        module.connectToModule(cable.destination);
                    } else {
                        module.connectToParameter(cable.destination, cable.type);
                    }
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

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before. GetBoundingClientRect related.
    module.addFirstCable();

    event.preventDefault();
}
