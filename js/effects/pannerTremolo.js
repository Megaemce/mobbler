import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function pannerTremolo(event, initalSpeed) {
    const speed = initalSpeed || 15;
    const speedInfo = "Frequency of oscillator that makes trembling effect";

    let module = new Module("panner tremolo", true, false, false, undefined, true, true);

    module.audioNode = {
        inputNode: audioContext.createStereoPanner(),
        oscillatorNode: audioContext.createOscillator(),
        get speed() {
            return this.oscillatorNode.frequency;
        },
        set speed(value) {
            this.oscillatorNode.frequency.value = value;
        },
    };

    module.createSlider("speed", speed, 0, 20, 0.1, "Hz", false, speedInfo);

    module.audioNode.oscillatorNode.type = "sine";
    module.audioNode.oscillatorNode.start(0);

    module.audioNode.oscillatorNode.connect(module.audioNode.inputNode.pan);

    module.audioNode.outputNode = module.audioNode.inputNode;

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
