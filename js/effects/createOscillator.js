import createModule from '../structure/createModule.js';
import createModuleSlider from '../structure/createModuleSlider.js';
import audioContext from '../main.js'

export default function createOscillator(event, initalFrequency, initalDetune) {
    const oscTypes = ["sine", "square", "sawtooth", "triangle"];

    let playButton = document.createElement("div");
    let module = createModule("oscillator", false, false, false, oscTypes);

    createModuleSlider(module, "frequency", initalFrequency, 0.1, 2000, 0.01, "Hz", true);
    createModuleSlider(module, "detune", initalDetune, -1200, 1200, 1, "cents", false);

    playButton.classList.add("switch");
    playButton.alt = "play";
    playButton.onclick = function () {
        let frequency = module.content.controllers.frequency.value.innerText; //.value is a pointer not returner
        let detune = module.content.controllers.detune.slider.value;
        let type = oscTypes[module.content.options.select.selectedIndex];
        let playButton = this;

        if (playButton.isPlaying) {
            //stop
            module.head.diode.className = "diode";
            playButton.isPlaying = false;
            playButton.classList.remove("switch-on");

            // if there is a sound installed
            if (module.audioNode) {
                if (module.outcomingCables) {
                    module.outcomingCables.forEach(function (cable) {
                        module.audioNode.disconnect(cable.destination.audioNode);
                    });
                }
                module.audioNode = undefined;
            }

        } else {
            module.head.diode.className = "diode diode-on";
            playButton.isPlaying = true;
            playButton.classList.add("switch-on");

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

    module.footer.classList.add("move-by-switch")

    module.content.options.select.onchange = function () {
        // if we have a playing oscillator, go ahead and switch it live
        if (module.audioNode)
            module.audioNode.type = oscTypes[this.selectedIndex];
    };


    module.content.controllers.appendChild(playButton);

    event.preventDefault();
}