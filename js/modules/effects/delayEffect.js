import Module from "../../classes/Module.js";
import Parameter from "../../classes/Parameter.js";
import { audioContext } from "../../main.js";

export default function delayEffect(event, initalDelay, initalDryness, initalFeedback) {
    const delay = parseFloat(initalDelay || 0.1);
    const dryness = parseFloat(initalDryness || 0.3);
    const feedback = parseFloat(initalFeedback || 0.8);
    const delayInfo = "Number of seconds from input signal to be storage and play back";
    const drynessInfo = "Loudness of original signal without effect";
    const feedbackInfo = "The return of a portion of the output signal back into delay loop";

    const module = new Module("delay effect", true, false, false, undefined);

    module.audioNode = {
        dryNode: new GainNode(audioContext), // dryness of the delay
        delayNode: new DelayNode(audioContext),
        inputNode: new GainNode(audioContext),
        outputNode: new GainNode(audioContext),
        feedbackNode: new GainNode(audioContext), // duration of the delay
        dryness: new Parameter(dryness, (value) => {
            module.audioNode.dryNode.gain.value = value;
        }),
        delayTime: new Parameter(delay, (value) => {
            module.audioNode.delayNode.delayTime.value = value;
        }),
        feedback: new Parameter(feedback, (value) => {
            module.audioNode.feedbackNode.gain.value = value;
        }),
        connect(destination) {
            if (destination.inputNode) this.outputNode.connect(destination.inputNode);
            else this.outputNode.connect(destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    module.createSlider("dryness", dryness, 0, 5, 0.1, "", false, drynessInfo);
    module.createSlider("delay Time", delay, 0, 1, 0.1, "sec", false, delayInfo);
    module.createSlider("feedback", feedback, 0, 0.9, 0.1, "sec", false, feedbackInfo);

    module.audioNode.dryNode.connect(module.audioNode.outputNode);
    module.audioNode.inputNode.connect(module.audioNode.dryNode);
    module.audioNode.inputNode.connect(module.audioNode.delayNode);
    module.audioNode.delayNode.connect(module.audioNode.feedbackNode);
    module.audioNode.delayNode.connect(module.audioNode.outputNode);
    module.audioNode.feedbackNode.connect(module.audioNode.delayNode);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
