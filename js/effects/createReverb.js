import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createReverb(event, initalDelay, initalLevel, initalBufferName) {
    let irNames = Object.keys(audioContext.nameIRBuffer);
    let module = new Module("reverb", true, false, false, irNames);
    module.createSlider("delay time", initalDelay, 0, 5, 0.1, "sec", false);
    module.createSlider("level", initalLevel, 0, 5, 0.1, "", false);

    module.audioNodes = {
        inputNode: { audioNode: audioContext.createGain() },
        outputNode: { audioNode: audioContext.createGain() },
        convolerNode: { audioNode: audioContext.createConvolver() },
        levelNode: { audioNode: audioContext.createGain() },
        delayNode: { audioNode: audioContext.createGain() },
        delaytime: (value) => {
            module.audioNodes.delayNode.audioNode.gain.value = value;
        },
        level: (value) => {
            module.audioNodes.levelNode.audioNode.gain.value = value;
        },
    };

    module.audioNodes.inputNode.audioNode.connect(module.audioNodes.convolerNode.audioNode);
    module.audioNodes.inputNode.audioNode.connect(module.audioNodes.delayNode.audioNode);
    module.audioNodes.convolerNode.audioNode.connect(module.audioNodes.levelNode.audioNode);
    module.audioNodes.levelNode.audioNode.connect(module.audioNodes.outputNode.audioNode);
    module.audioNodes.delayNode.audioNode.connect(module.audioNodes.outputNode.audioNode);

    module.audioNodes.input = module.audioNodes.inputNode.audioNode;
    module.audioNodes.output = module.audioNodes.outputNode.audioNode;

    module.audioNodes.convolerNode.audioNode.buffer = audioContext.nameIRBuffer[initalBufferName];
    module.audioNodes.delayNode.audioNode.gain.value = initalDelay;
    module.audioNodes.levelNode.audioNode.gain.value = initalLevel;

    module.content.options.select.onchange = function () {
        module.audioNodes.convolerNode.audioNode.buffer = audioContext.nameIRBuffer[this.value];
    };

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();

    event.preventDefault();
}
