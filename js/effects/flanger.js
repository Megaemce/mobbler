import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function flanger(event, initalDelay, initalDepth, initalFeedback, initalSpeed) {
    const delay = initalDelay || 0.005;
    const depth = initalDepth || 0.002;
    const speed = initalSpeed || 0.25;
    const feedback = initalFeedback || 0.5;
    const delayInfo = "Number of seconds from input signal to be storage and play back";
    const depthInfo = "Length of the effect";
    const speedInfo = "Frequency of oscillator that makes swirling sounds";
    const feedbackInfo = "The return of a portion of the output signal back into delay loop";

    let module = new Module("flanger", true, false, false, undefined, true);

    module.audioNode = {
        inputNode: audioContext.createGain(),
        outputNode: audioContext.createGain(),
        depthNode: audioContext.createGain(),
        feedbackNode: audioContext.createGain(),
        delayNode: audioContext.createDelay(),
        oscillatorNode: audioContext.createOscillator(),
        get speed() {
            return this.oscillatorNode.frequency;
        },
        set speed(value) {
            this.oscillatorNode.frequency.value = value;
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
        get depth() {
            return this.depthNode.gain;
        },
        set depth(value) {
            this.depthNode.gain.value = value;
        },
        return: this.inputNode,
    };

    module.createSlider("delay time", delay, 0, 0.01, 0.001, "sec", false, delayInfo);
    module.createSlider("depth", depth, 0, 0.01, 0.001, "", false, depthInfo);
    module.createSlider("feedback", feedback, 0, 1, 0.1, "sec", false, feedbackInfo);
    module.createSlider("speed", speed, 0, 1, 0.01, "Hz", false, speedInfo);

    module.audioNode.oscillatorNode.connect(module.audioNode.depthNode);
    module.audioNode.depthNode.connect(module.audioNode.delayNode.delayTime);
    module.audioNode.inputNode.connect(module.audioNode.outputNode);
    module.audioNode.inputNode.connect(module.audioNode.delayNode);
    module.audioNode.delayNode.connect(module.audioNode.outputNode);
    module.audioNode.delayNode.connect(module.audioNode.feedbackNode);
    module.audioNode.feedbackNode.connect(module.audioNode.inputNode);

    module.audioNode.oscillatorNode.type = "sine";
    module.audioNode.oscillatorNode.start(0);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
