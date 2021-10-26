import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function reverb(event, initalDryness, initalWetness, initalBufferName) {
    const irNames = Object.keys(audioContext.nameIRBuffer);
    const dryness = initalDryness || 0.5;
    const wetness = initalWetness || 1;
    const bufferName = initalBufferName || irNames[1];
    const drynessInfo = "Loudness of signal without any signal processing";
    const wetnessInfo = "Loudness of signal with full amount of an effect";

    let module = new Module("reverb", true, false, false, irNames);

    module.audioNodes = {
        inputNode: { audioNode: audioContext.createGain() },
        outputNode: { audioNode: audioContext.createGain() },
        convolerNode: { audioNode: audioContext.createConvolver() },
        wetnessNode: { audioNode: audioContext.createGain() },
        drynessNode: { audioNode: audioContext.createGain() },
        dryness: (value) => {
            module.audioNodes.drynessNode.audioNode.gain.value = value;
        },
        wetness: (value) => {
            module.audioNodes.wetnessNode.audioNode.gain.value = value;
        },
    };

    module.createSlider("dryness", dryness, 0, 5, 0.1, "", false, drynessInfo);
    module.createSlider("wetness", wetness, 0, 5, 0.1, "", false, wetnessInfo);

    module.audioNodes.inputNode.audioNode.connect(module.audioNodes.convolerNode.audioNode);
    module.audioNodes.inputNode.audioNode.connect(module.audioNodes.drynessNode.audioNode);
    module.audioNodes.convolerNode.audioNode.connect(module.audioNodes.wetnessNode.audioNode);
    module.audioNodes.wetnessNode.audioNode.connect(module.audioNodes.outputNode.audioNode);
    module.audioNodes.drynessNode.audioNode.connect(module.audioNodes.outputNode.audioNode);

    module.audioNodes.input = module.audioNodes.inputNode.audioNode;
    module.audioNodes.output = module.audioNodes.outputNode.audioNode;

    module.audioNodes.convolerNode.audioNode.buffer = audioContext.nameIRBuffer[bufferName];

    module.content.options.select.onchange = function () {
        module.audioNodes.convolerNode.audioNode.buffer = audioContext.nameIRBuffer[this.value];
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
