import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function delayEffect(event, initalDryness, initalDelay, initalFeedback) {
    const delay = initalDelay || 0.1;
    const dryness = initalDryness || 0.3;
    const feedback = initalFeedback || 0.8;
    const delayInfo = "Number of seconds from input signal to be storage and play back";
    const drynessInfo = "Loudness of original signal without effect";
    const feedbackInfo = "The return of a portion of the output signal back into delay loop";

    let module = new Module("delay effect", true, false, false, undefined);

    module.audioNode = {
        inputNode: audioContext.createGain(),
        dryNode: audioContext.createGain(), // dryness of the delay
        feedbackNode: audioContext.createGain(), // duration of the delay
        delayNode: audioContext.createDelay(),
        outputNode: audioContext.createGain(),
        get dryness() {
            return this.dryNode.gain;
        },
        set dryness(value) {
            this.dryNode.gain.value = value;
        },
        get delaytime() {
            return this.delayNode.delayTime;
        },
        set delaytime(value) {
            this.delayNode.delayTime.value = value;
        },
        get feedback() {
            return this.feedbackNode.gain;
        },
        set feedback(value) {
            this.feedbackNode.gain.value = value;
        },
        connect(destination) {
            this.outputNode.connect(destination.inputNode ? destination.inputNode : destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    module.createSlider("dryness", dryness, 0, 5, 0.1, "", false, drynessInfo);
    module.createSlider("delay time", delay, 0, 1, 0.1, "sec", false, delayInfo);
    module.createSlider("feedback", feedback, 0, 1, 0.1, "sec", false, feedbackInfo);

    module.audioNode.inputNode.connect(module.audioNode.dryNode);
    module.audioNode.dryNode.connect(module.audioNode.outputNode);
    module.audioNode.inputNode.connect(module.audioNode.delayNode);
    module.audioNode.delayNode.connect(module.audioNode.feedbackNode);
    module.audioNode.feedbackNode.connect(module.audioNode.delayNode);
    module.audioNode.delayNode.connect(module.audioNode.outputNode);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
