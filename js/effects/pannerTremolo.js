import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function pannerTremolo(event, initalSpeed) {
    const speed = parseFloat(initalSpeed || 15);
    const speedInfo = "Frequency of oscillator that makes trembling effect";

    const module = new Module("panner tremolo", true, false, false, undefined, true);

    module.audioNode = {
        inputNode: new GainNode(audioContext),
        pannerNode: new StereoPannerNode(audioContext),
        oscillatorNode: new OscillatorNode(audioContext, {
            type: "sine",
        }),
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

    module.audioNode.inputNode.connect(module.audioNode.pannerNode);
    module.audioNode.oscillatorNode.connect(module.audioNode.pannerNode.pan);
    module.audioNode.pannerNode.connect(module.audioNode.outputNode);

    module.audioNode.oscillatorNode.start(0);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
