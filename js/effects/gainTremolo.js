import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function gainTremolo(event, initalSpeed) {
    const speed = initalSpeed || 15;
    const speedInfo = "Frequency of oscillator that makes trembling effect";

    const module = new Module("gain tremolo", true, false, false, undefined, true);

    module.audioNode = {
        inputNode: new GainNode(audioContext),
        oscillatorNode: new OscillatorNode(audioContext),
        outputNode: new GainNode(audioContext),
        get speed() {
            return this.oscillatorNode.frequency;
        },
        set speed(value) {
            this.oscillatorNode.frequency.value = value;
        },
        connect(destination) {
            this.outputNode.connect(destination.inputNode ? destination.inputNode : destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    module.createSlider("speed", speed, 0, 20, 0.1, "Hz", false, speedInfo);

    module.audioNode.oscillatorNode.type = "sine";
    module.audioNode.oscillatorNode.start(0);

    module.audioNode.oscillatorNode.connect(module.audioNode.inputNode.gain);
    module.audioNode.inputNode.connect(module.audioNode.outputNode);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
