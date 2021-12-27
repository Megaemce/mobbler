import Module from "../classes/Module.js";
import Parameter from "../classes/Parameter.js";
import { audioContext } from "../main.js";

export default function chorus(event, initalDelay, initalDepth, initalSpeed, initalFeedback) {
    const delay = parseFloat(initalDelay || 0.12);
    const depth = parseFloat(initalDepth || 0.01);
    const speed = parseFloat(initalSpeed || 0.1);
    const feedback = parseFloat(initalFeedback || 0.6);
    const delayInfo = "Number of seconds from input signal to be storage and play back";
    const depthInfo = "Length of the effect";
    const speedInfo = "Frequency of oscillator that makes change in delay time";
    const feedbackInfo = "The return of a portion of the output signal back into delay loop";

    const module = new Module("chorus", true, false, false, undefined);

    module.audioNode = {
        mixNode: new GainNode(audioContext),
        dryNode: new GainNode(audioContext, { gain: 1 / Math.sqrt(2) }), // don't cancel each other on mixNode
        wetNode: new GainNode(audioContext, { gain: 1 / Math.sqrt(2) }),
        inputNode: new GainNode(audioContext),
        outputNode: new GainNode(audioContext),
        depthLNode: new GainNode(audioContext, { gain: depth }),
        depthRNode: new GainNode(audioContext, { gain: -depth }),
        delayLNode: new DelayNode(audioContext, { delayTime: delay }),
        delayRNode: new DelayNode(audioContext, { delayTime: delay }),
        feedbackNode: new GainNode(audioContext, { gain: feedback }),
        oscillatorLNode: new OscillatorNode(audioContext, { type: "triangle", frequency: speed }),
        oscillatorRNode: new OscillatorNode(audioContext, { type: "triangle", frequency: speed }),
        delayTime: new Parameter(delay, (value) => {
            module.audioNode.delayLNode.delayTime.value = value;
            module.audioNode.delayRNode.delayTime.value = value;
        }),
        depth: new Parameter(depth, (value) => {
            module.audioNode.depthLNode.gain.value = value;
            module.audioNode.depthRNode.gain.value = -value;
        }),
        speed: new Parameter(speed, (value) => {
            module.audioNode.oscillatorRNode.frequency.value = value;
            module.audioNode.oscillatorLNode.frequency.value = value;
        }),
        get feedback() {
            return this.feedbackNode.gain;
        },
        connect(destination) {
            if (destination.inputNode) this.outputNode.connect(destination.inputNode);
            else this.outputNode.connect(destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    module.createSlider("delay Time", delay, 0, 1, 0.01, "sec", false, delayInfo);
    module.createSlider("depth", depth, 0, 1, 0.01, "", false, depthInfo);
    module.createSlider("feedback", feedback, 0, 0.7, 0.01, "", false, feedbackInfo);
    module.createSlider("speed", speed, 0, 1, 0.01, "Hz", false, speedInfo);

    module.audioNode.wetNode.connect(module.audioNode.mixNode);
    module.audioNode.dryNode.connect(module.audioNode.mixNode);
    module.audioNode.mixNode.connect(module.audioNode.feedbackNode);
    module.audioNode.mixNode.connect(module.audioNode.outputNode);
    module.audioNode.inputNode.connect(module.audioNode.dryNode);
    module.audioNode.inputNode.connect(module.audioNode.feedbackNode);
    module.audioNode.delayLNode.connect(module.audioNode.wetNode);
    module.audioNode.delayRNode.connect(module.audioNode.wetNode);
    module.audioNode.depthLNode.connect(module.audioNode.delayLNode.delayTime);
    module.audioNode.depthRNode.connect(module.audioNode.delayRNode.delayTime);
    module.audioNode.feedbackNode.connect(module.audioNode.delayLNode);
    module.audioNode.feedbackNode.connect(module.audioNode.delayRNode);
    module.audioNode.oscillatorRNode.connect(module.audioNode.depthLNode);
    module.audioNode.oscillatorLNode.connect(module.audioNode.depthRNode);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
