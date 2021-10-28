import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function tremolo(event, initalSpeed) {
    const speed = initalSpeed | 15;
    const speedInfo = "Frequency of oscillator that makes trembling effect";

    let module = new Module("tremolo", true, false, false, undefined);

    module.audioNodes = {
        inputNode: audioContext.createGain(),
        oscillatorNode: audioContext.createOscillator(),
        speed: (value) => {
            module.audioNodes.oscillatorNode.frequency.value = value;
        },
    };

    module.createAudioSlider("speed", speed, 0, 20, 0.1, "Hz", false, speedInfo);

    module.audioNodes.oscillatorNode.type = "sine";
    module.audioNodes.oscillatorNode.start(0);

    module.audioNodes.oscillatorNode.connect(module.audioNodes.inputNode.gain);

    module.audioNodes.outputNode = module.audioNodes.inputNode;

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
