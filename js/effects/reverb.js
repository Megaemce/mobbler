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
        inputNode: audioContext.createGain(),
        outputNode: audioContext.createGain(),
        convolerNode: audioContext.createConvolver(),
        wetnessNode: audioContext.createGain(),
        drynessNode: audioContext.createGain(),
        dryness: (value) => {
            module.audioNodes.drynessNode.gain.value = value;
        },
        wetness: (value) => {
            module.audioNodes.wetnessNode.gain.value = value;
        },
    };

    module.createSlider("dryness", dryness, 0, 5, 0.1, "", false, drynessInfo);
    module.createSlider("wetness", wetness, 0, 5, 0.1, "", false, wetnessInfo);

    module.audioNodes.inputNode.connect(module.audioNodes.convolerNode);
    module.audioNodes.inputNode.connect(module.audioNodes.drynessNode);
    module.audioNodes.convolerNode.connect(module.audioNodes.wetnessNode);
    module.audioNodes.wetnessNode.connect(module.audioNodes.outputNode);
    module.audioNodes.drynessNode.connect(module.audioNodes.outputNode);

    module.audioNodes.convolerNode.buffer = audioContext.nameIRBuffer[bufferName];

    module.content.options.select.onchange = function () {
        module.audioNodes.convolerNode.buffer = audioContext.nameIRBuffer[this.value];
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
