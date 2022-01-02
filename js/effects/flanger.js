import Module from "../classes/Module.js";
import Parameter from "../classes/Parameter.js";
import { audioContext } from "../main.js";

export default function flanger(event, initalDelay, initalDepth, initalSpeed, initalFeedback) {
    const delay = parseFloat(initalDelay || 0.005);
    const depth = parseFloat(initalDepth || 0.002);
    const speed = parseFloat(initalSpeed || 0.25);
    const feedback = parseFloat(initalFeedback || 0.5);
    const delayInfo = "Affects the frequency range of the flanger's sweep by adjusting the initial delay time";
    const depthInfo = "Length of the effect";
    const speedInfo = "Frequency of oscillator that makes swirling sounds";
    const feedbackInfo = "The return of a portion of the output signal back into delay loop";

    const module = new Module("flanger", true, false, false, undefined);

    module.audioNode = {
        depthNode: new GainNode(audioContext),
        inputNode: new GainNode(audioContext),
        delayNode: new DelayNode(audioContext),
        outputNode: new GainNode(audioContext),
        feedbackNode: new GainNode(audioContext),
        oscillatorNode: new OscillatorNode(audioContext, { type: "sine" }),
        speed: new Parameter(speed, (value) => {
            module.audioNode.oscillatorNode.frequency.value = value;
        }),
        delayTime: new Parameter(delay, (value) => {
            module.audioNode.delayNode.delayTime.value = value;
        }),
        feedback: new Parameter(feedback, (value) => {
            module.audioNode.feedbackNode.gain.value = value;
        }),
        depth: new Parameter(depth, (value) => {
            module.audioNode.depthNode.gain.value = value;
        }),
        connect(destination) {
            if (destination.inputNode) this.outputNode.connect(destination.inputNode);
            else this.outputNode.connect(destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    module.createSlider("delay Time", delay, 0, 0.01, 0.001, "sec", false, delayInfo);
    module.createSlider("depth", depth, 0, 0.01, 0.001, "", false, depthInfo);
    module.createSlider("feedback", feedback, 0, 1, 0.1, "sec", false, feedbackInfo);
    module.createSlider("speed", speed, 0, 5, 0.01, "Hz", false, speedInfo);

    module.audioNode.inputNode.connect(module.audioNode.outputNode);
    module.audioNode.inputNode.connect(module.audioNode.delayNode);
    module.audioNode.delayNode.connect(module.audioNode.outputNode);
    module.audioNode.delayNode.connect(module.audioNode.feedbackNode);
    module.audioNode.depthNode.connect(module.audioNode.delayNode.delayTime);
    module.audioNode.feedbackNode.connect(module.audioNode.inputNode);
    module.audioNode.oscillatorNode.connect(module.audioNode.depthNode);

    module.audioNode.oscillatorNode.start(0);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
