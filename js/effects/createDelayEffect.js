import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createDelayEffect(event, initalWetness, initalDelay, initalFeedback) {
    let module = new Module("delay effect", true, false, false, undefined);
    module.createSlider("wetness", initalWetness, 0, 5, 0.1, "", false);
    module.createSlider("delay time", initalDelay, 0, 1, 0.1, "sec", false);
    module.createSlider("feedback", initalFeedback, 0, 1, 0.1, "sec", false);

    module.audioNodes = {
        inputGainNode: { audioNode: audioContext.createGain() },
        outputGainNode: { audioNode: audioContext.createGain() },
        wetGainNode: { audioNode: audioContext.createGain() }, // wetness of the delay
        durationGainNode: { audioNode: audioContext.createGain() }, // duration of the delay
        delayNode: { audioNode: audioContext.createDelay() },
        wetness: (value) => {
            module.audioNodes.wetGainNode.audioNode.gain.value = value;
        },
        delaytime: (value) => {
            module.audioNodes.delayNode.audioNode.delayTime.value = value;
        },
        feedback: (value) => {
            module.audioNodes.durationGainNode.audioNode.gain.value = value;
        },
    };

    module.audioNodes.inputGainNode.audioNode.connect(module.audioNodes.wetGainNode.audioNode);
    module.audioNodes.wetGainNode.audioNode.connect(module.audioNodes.outputGainNode.audioNode);
    module.audioNodes.inputGainNode.audioNode.connect(module.audioNodes.delayNode.audioNode);
    module.audioNodes.delayNode.audioNode.connect(module.audioNodes.durationGainNode.audioNode);
    module.audioNodes.durationGainNode.audioNode.connect(module.audioNodes.delayNode.audioNode);
    module.audioNodes.delayNode.audioNode.connect(module.audioNodes.outputGainNode.audioNode);

    module.audioNodes.input = module.audioNodes.inputGainNode.audioNode;
    module.audioNodes.output = module.audioNodes.outputGainNode.audioNode;

    module.audioNodes.wetGainNode.audioNode.gain.value = initalWetness;
    module.audioNodes.delayNode.audioNode.delayTime.value = initalDelay;
    module.audioNodes.durationGainNode.audioNode.gain.value = initalFeedback;

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();

    event.preventDefault();
}
