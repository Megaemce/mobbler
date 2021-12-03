import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function gainTremolo(event, initalSpeed) {
    const speed = parseFloat(initalSpeed || 15);
    const speedInfo = "Frequency of oscillator that makes trembling effect";

    const module = new Module("gain tremolo", true, false, false, undefined, true);

    module.audioNode = {
        inputNode: new GainNode(audioContext),
        oscillatorNode: new OscillatorNode(audioContext, {
            type: "sine",
        }),
        outputNode: new GainNode(audioContext),
        get speed() {
            return this.oscillatorNode.frequency;
        },
        connect(destination) {
            if (destination.inputNode) this.outputNode.connect(destination.inputNode);
            else this.outputNode.connect(destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    module.createSlider("speed", speed, 0, 20, 0.1, "Hz", false, speedInfo);

    module.audioNode.oscillatorNode.connect(module.audioNode.inputNode.gain);
    module.audioNode.inputNode.connect(module.audioNode.outputNode);

    module.audioNode.oscillatorNode.start(0);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
