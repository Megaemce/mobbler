import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createFlanger(event, initalDelay, initalDepth, initalFeedback, initalSpeed) {
    const delayInfo = "Number of seconds from input signal to be storage and play back";
    const depthInfo = "Length of the effect";
    const feedbackInfo = "The return of a portion of the output signal back into delay loop";
    const speedInfo = "Frequency of oscillator that makes swirling sounds";

    let module = new Module("flanger", true, false, false, undefined);
    module.createSlider("delay time", initalDelay, 0, 0.01, 0.001, "sec", false, delayInfo);
    module.createSlider("depth", initalDepth, 0, 0.01, 0.001, "", false, depthInfo);
    module.createSlider("feedback", initalFeedback, 0, 1, 0.1, "sec", false, feedbackInfo);
    module.createSlider("speed", initalSpeed, 0, 1, 0.01, "Hz", false, speedInfo);

    module.audioNodes = {
        inputNode: { audioNode: audioContext.createGain() },
        outputNode: { audioNode: audioContext.createGain() },
        gainNode: { audioNode: audioContext.createGain() },
        feedbackNode: { audioNode: audioContext.createGain() },
        delayNode: { audioNode: audioContext.createDelay() },
        oscillatorNode: { audioNode: audioContext.createOscillator() },
        speed: (value) => {
            module.audioNodes.oscillatorNode.audioNode.frequency.value = value;
        },
        delaytime: (value) => {
            module.audioNodes.delayNode.audioNode.delayTime.value = value;
        },
        feedback: (value) => {
            module.audioNodes.feedbackNode.audioNode.gain.value = value;
        },
        depth: (value) => {
            module.audioNodes.gainNode.audioNode.gain.value = value;
        },
    };

    module.audioNodes.oscillatorNode.audioNode.connect(module.audioNodes.gainNode.audioNode);
    module.audioNodes.gainNode.audioNode.connect(module.audioNodes.delayNode.audioNode.delayTime);
    module.audioNodes.inputNode.audioNode.connect(module.audioNodes.outputNode.audioNode);
    module.audioNodes.inputNode.audioNode.connect(module.audioNodes.delayNode.audioNode);
    module.audioNodes.delayNode.audioNode.connect(module.audioNodes.outputNode.audioNode);
    module.audioNodes.delayNode.audioNode.connect(module.audioNodes.feedbackNode.audioNode);
    module.audioNodes.feedbackNode.audioNode.connect(module.audioNodes.inputNode.audioNode);

    module.audioNodes.oscillatorNode.audioNode.type = "sine";
    module.audioNodes.oscillatorNode.audioNode.start(0);

    module.audioNodes.input = module.audioNodes.inputNode.audioNode;
    module.audioNodes.output = module.audioNodes.outputNode.audioNode;

    module.audioNodes.delayNode.audioNode.delayTime.value = initalDelay;
    module.audioNodes.feedbackNode.audioNode.gain.value = initalFeedback;
    module.audioNodes.gainNode.audioNode.gain.value = initalDepth;
    module.audioNodes.oscillatorNode.audioNode.frequency.value = initalSpeed;

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();

    event.preventDefault();
}
