import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createTremolo(event, initalSpeed) {
    const speed = initalSpeed | 15;
    const speedInfo = "Frequency of oscillator that makes trembling effect";

    let module = new Module("tremolo", true, false, false, undefined);
    module.createSlider("speed", speed, 0, 20, 0.1, "Hz", false, speedInfo);

    module.audioNodes = {
        inputNode: { audioNode: audioContext.createGain() },
        oscillatorNode: { audioNode: audioContext.createOscillator() },
        speed: (value) => {
            module.audioNodes.oscillatorNode.audioNode.frequency.value = value;
        },
    };

    module.audioNodes.oscillatorNode.audioNode.connect(module.audioNodes.inputNode.audioNode.gain);

    module.audioNodes.oscillatorNode.audioNode.type = "sine";
    module.audioNodes.oscillatorNode.audioNode.start(0);

    module.audioNodes.input = module.audioNodes.inputNode.audioNode;
    module.audioNodes.output = module.audioNodes.inputNode.audioNode;

    module.audioNodes.oscillatorNode.audioNode.frequency.value = speed;

    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();
}
