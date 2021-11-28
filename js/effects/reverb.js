import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function reverb(event, initalDryness, initalWetness, initalBufferName) {
    const irNames = Object.keys(audioContext.nameIRBuffer);
    const dryness = parseFloat(initalDryness || 0.5);
    const wetness = parseFloat(initalWetness || 1);
    const bufferName = String(initalBufferName || irNames[1]);
    const drynessInfo = "Loudness of signal without any signal processing";
    const wetnessInfo = "Loudness of signal with full amount of an effect";

    const module = new Module("reverb", true, false, false, irNames);

    module.audioNode = {
        inputNode: new GainNode(audioContext),
        convolerNode: new ConvolverNode(audioContext, {
            buffer: audioContext.nameIRBuffer[bufferName],
        }),
        wetnessNode: new GainNode(audioContext),
        drynessNode: new GainNode(audioContext),
        outputNode: new GainNode(audioContext),
        get dryness() {
            return this.drynessNode.gain;
        },
        set dryness(value) {
            this.drynessNode.gain.value = value;
        },
        get wetness() {
            return this.wetnessNode.gain;
        },
        set wetness(value) {
            this.wetnessNode.gain.value = value;
        },
        connect(destination) {
            this.outputNode.connect(destination.inputNode ? destination.inputNode : destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    module.createSlider("dryness", dryness, 0, 5, 0.1, "", false, drynessInfo);
    module.createSlider("wetness", wetness, 0, 5, 0.1, "", false, wetnessInfo);

    module.audioNode.inputNode.connect(module.audioNode.convolerNode);
    module.audioNode.inputNode.connect(module.audioNode.drynessNode);
    module.audioNode.convolerNode.connect(module.audioNode.wetnessNode);
    module.audioNode.wetnessNode.connect(module.audioNode.outputNode);
    module.audioNode.drynessNode.connect(module.audioNode.outputNode);

    module.content.options.select.onchange = function () {
        module.audioNode.convolerNode.buffer = audioContext.nameIRBuffer[this.value];
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
