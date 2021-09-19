import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createDelayEffect(event, initalWetness, initalDelay, initalFeedback) {
    let module = new Module("delay effect", true, false, false, undefined);
    module.createSlider("wetness", initalWetness, 0, 5, 0.1, "", false);
    module.createSlider("delay time", initalDelay, 0, 1, 0.1, "sec", false);
    module.createSlider("feedback", initalFeedback, 0, 1, 0.1, "sec", false);

    module.audioNodes = {
        inputNode: { audioNode: audioContext.createGain() },
        outputNode: { audioNode: audioContext.createGain() },
        wetNode: { audioNode: audioContext.createGain() }, // wetness of the delay
        durationNode: { audioNode: audioContext.createGain() }, // duration of the delay
        delayNode: { audioNode: audioContext.createDelay() },
        wetness: (value) => {
            module.audioNodes.wetNode.audioNode.gain.value = value;
        },
        delaytime: (value) => {
            module.audioNodes.delayNode.audioNode.delayTime.value = value;
        },
        feedback: (value) => {
            module.audioNodes.durationNode.audioNode.gain.value = value;
        },
    };

    module.audioNodes.inputNode.audioNode.connect(module.audioNodes.wetNode.audioNode);
    module.audioNodes.wetNode.audioNode.connect(module.audioNodes.outputNode.audioNode);
    module.audioNodes.inputNode.audioNode.connect(module.audioNodes.delayNode.audioNode);
    module.audioNodes.delayNode.audioNode.connect(module.audioNodes.durationNode.audioNode);
    module.audioNodes.durationNode.audioNode.connect(module.audioNodes.delayNode.audioNode);
    module.audioNodes.delayNode.audioNode.connect(module.audioNodes.outputNode.audioNode);

    module.audioNodes.input = module.audioNodes.inputNode.audioNode;
    module.audioNodes.output = module.audioNodes.outputNode.audioNode;

    module.audioNodes.wetNode.audioNode.gain.value = initalWetness;
    module.audioNodes.delayNode.audioNode.delayTime.value = initalDelay;
    module.audioNodes.durationNode.audioNode.gain.value = initalFeedback;

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();

    event.preventDefault();
}
