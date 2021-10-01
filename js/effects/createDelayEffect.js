import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createDelayEffect(event, initalWetness, initalDelay, initalFeedback) {
    const wetness = initalWetness || 1
    const delay = initalDelay || 0.5
    const feedback = initalFeedback || 0.3 
    const wetnessInfo = "Loudness of signal with full amount of an effect";
    const delayInfo = "Number of seconds from input signal to be storage and play back";
    const feedbackInfo = "The return of a portion of the output signal back into delay loop";

    let module = new Module("delay effect", true, false, false, undefined);

    module.createSlider("wetness", wetness, 0, 5, 0.1, "", false, wetnessInfo);
    module.createSlider("delay time", delay, 0, 1, 0.1, "sec", false, delayInfo);
    module.createSlider("feedback", feedback, 0, 1, 0.1, "sec", false, feedbackInfo);

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

    module.audioNodes.wetNode.audioNode.gain.value = wetness;
    module.audioNodes.delayNode.audioNode.delayTime.value = delay;
    module.audioNodes.durationNode.audioNode.gain.value = feedback;

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();

    event.preventDefault();
}
