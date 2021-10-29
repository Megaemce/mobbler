import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function delayEffect(event, initalWetness, initalDelay, initalFeedback) {
    const delay = initalDelay || 0.1;
    const wetness = initalWetness || 0.3;
    const feedback = initalFeedback || 0.8;
    const delayInfo = "Number of seconds from input signal to be storage and play back";
    const wetnessInfo = "Loudness of signal with full amount of an effect";
    const feedbackInfo = "The return of a portion of the output signal back into delay loop";

    let module = new Module("delay effect", true, false, false, undefined);

    module.audioNodes = {
        inputNode: audioContext.createGain(),
        outputNode: audioContext.createGain(),
        wetNode: audioContext.createGain(), // wetness of the delay
        durationNode: audioContext.createGain(), // duration of the delay
        delayNode: audioContext.createDelay(),
        wetness: (value) => {
            module.audioNodes.wetNode.gain.value = value;
        },
        delaytime: (value) => {
            module.audioNodes.delayNode.delayTime.value = value;
        },
        feedback: (value) => {
            module.audioNodes.durationNode.gain.value = value;
        },
    };

    module.createSlider("wetness", wetness, 0, 5, 0.1, "", false, wetnessInfo);
    module.createSlider("delay time", delay, 0, 1, 0.1, "sec", false, delayInfo);
    module.createSlider("feedback", feedback, 0, 1, 0.1, "sec", false, feedbackInfo);

    module.audioNodes.inputNode.connect(module.audioNodes.wetNode);
    module.audioNodes.wetNode.connect(module.audioNodes.outputNode);
    module.audioNodes.inputNode.connect(module.audioNodes.delayNode);
    module.audioNodes.delayNode.connect(module.audioNodes.durationNode);
    module.audioNodes.durationNode.connect(module.audioNodes.delayNode);
    module.audioNodes.delayNode.connect(module.audioNodes.outputNode);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
