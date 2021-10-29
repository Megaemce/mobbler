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

    let module = new Module("flanger", true, false, false, undefined);

    module.audioNodes = {
        inputNode: audioContext.createGain(),
        outputNode: audioContext.createGain(),
        gainNode: audioContext.createGain(),
        feedbackNode: audioContext.createGain(),
        delayNode: audioContext.createDelay(),
        oscillatorNode: audioContext.createOscillator(),
        speed: (value) => {
            module.audioNodes.oscillatorNode.frequency.value = value;
        },
        delaytime: (value) => {
            module.audioNodes.delayNode.delayTime.value = value;
        },
        feedback: (value) => {
            module.audioNodes.feedbackNode.gain.value = value;
        },
        depth: (value) => {
            module.audioNodes.gainNode.gain.value = value;
        },
    };

    module.createSlider("delay time", delay, 0, 0.01, 0.001, "sec", false, delayInfo);
    module.createSlider("depth", depth, 0, 0.01, 0.001, "", false, depthInfo);
    module.createSlider("feedback", feedback, 0, 1, 0.1, "sec", false, feedbackInfo);
    module.createSlider("speed", speed, 0, 1, 0.01, "Hz", false, speedInfo);

    module.audioNodes.oscillatorNode.connect(module.audioNodes.gainNode);
    module.audioNodes.gainNode.connect(module.audioNodes.delayNode.delayTime);
    module.audioNodes.inputNode.connect(module.audioNodes.outputNode);
    module.audioNodes.inputNode.connect(module.audioNodes.delayNode);
    module.audioNodes.delayNode.connect(module.audioNodes.outputNode);
    module.audioNodes.delayNode.connect(module.audioNodes.feedbackNode);
    module.audioNodes.feedbackNode.connect(module.audioNodes.inputNode);

    module.audioNodes.oscillatorNode.type = "sine";
    module.audioNodes.oscillatorNode.start(0);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
