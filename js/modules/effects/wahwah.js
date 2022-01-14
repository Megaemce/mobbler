import Module from "../../classes/Module.js";
import Parameter from "../../classes/Parameter.js";
import { audioContext } from "../../main.js";

export default function wahwah(event, initalQ, initalSpeed, initalDepth) {
    const q = parseFloat(initalQ || 2.5);
    const speed = parseFloat(initalSpeed || 8.5);
    const depth = parseFloat(initalDepth || 0.8);
    const qInfo = "Controls the width of the band. The width becomes narrower as the Q value increases";
    const speedInfo = "Frequency of oscillator that change bandpass inital frequency";
    const depthInfo = "Depth of the bandpass change from oscillator";

    const module = new Module("wahwah", true, false, false, undefined, true);

    module.audioNode = {
        inputNode: new GainNode(audioContext),
        outputNode: new GainNode(audioContext),
        oscillatorNode: new OscillatorNode(audioContext, { type: "sine" }),
        biquadNode: new BiquadFilterNode(audioContext, { type: "bandpass", Q: q, frequency: 1200 }),
        depthNode: new GainNode(audioContext, { gain: depth }),
        speed: new Parameter(speed, (value) => {
            module.audioNode.oscillatorNode.frequency.value = value;
        }),
        depth: new Parameter(depth, (value) => {
            // oscillator output value is just [-1,1] so make it [-800*value,800*value]
            module.audioNode.depthNode.gain.value = 800 * value;
        }),
        q: new Parameter(q, (value) => {
            module.audioNode.biquadNode.Q.value = value;
        }),
        connect(destination) {
            if (destination.inputNode) this.outputNode.connect(destination.inputNode);
            else this.outputNode.connect(destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    module.createSlider("speed", speed, 0, 20, 0.1, "Hz", false, speedInfo);
    module.createSlider("q", q, 0, 5, 0.1, "", false, qInfo);
    module.createSlider("depth", depth, 0, 1, 0.01, "", false, depthInfo);

    module.audioNode.inputNode.connect(module.audioNode.biquadNode);
    module.audioNode.oscillatorNode.connect(module.audioNode.depthNode);
    module.audioNode.depthNode.connect(module.audioNode.biquadNode.frequency);
    module.audioNode.biquadNode.connect(module.audioNode.outputNode);

    module.audioNode.oscillatorNode.start(0);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
