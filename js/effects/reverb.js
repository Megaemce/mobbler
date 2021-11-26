import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function reverb(event, initalDryness, initalWetness, initalBufferName) {
    const irNames = Object.keys(audioContext.nameIRBuffer);
    const dryness = initalDryness || 0.5;
    const wetness = initalWetness || 1;
    const bufferName = initalBufferName || irNames[1];
    const drynessInfo = "Loudness of signal without any signal processing";
    const wetnessInfo = "Loudness of signal with full amount of an effect";

    let module = new Module("reverb", true, false, false, irNames, true);

    module.audioNode = {
        inputNode: audioContext.createGain(),
        outputNode: audioContext.createGain(),
        convolerNode: audioContext.createConvolver(),
        wetnessNode: audioContext.createGain(),
        drynessNode: audioContext.createGain(),
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
    };

    module.createSlider("dryness", dryness, 0, 5, 0.1, "", false, drynessInfo);
    module.createSlider("wetness", wetness, 0, 5, 0.1, "", false, wetnessInfo);

    module.audioNode.inputNode.connect(module.audioNode.convolerNode);
    module.audioNode.inputNode.connect(module.audioNode.drynessNode);
    module.audioNode.convolerNode.connect(module.audioNode.wetnessNode);
    module.audioNode.wetnessNode.connect(module.audioNode.outputNode);
    module.audioNode.drynessNode.connect(module.audioNode.outputNode);

    module.audioNode.convolerNode.buffer = audioContext.nameIRBuffer[bufferName];

    module.content.options.select.onchange = function () {
        module.audioNode.convolerNode.buffer = audioContext.nameIRBuffer[this.value];
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
