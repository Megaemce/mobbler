import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createFlanger(event, initalDelay, initalDepth, initalFeedback, initalSpeed) {
    let module = new Module("flanger", true, false, false, undefined);
    module.createSlider("delay time", initalDelay, 0, 0.01, 0.001, "sec", false);
    module.createSlider("depth", initalDepth, 0, 0.01, 0.001, "", false);
    module.createSlider("feedback", initalFeedback, 0, 1, 0.1, "sec", false);
    module.createSlider("speed", initalSpeed, 0, 1, 0.01, "Hz", false);

    module.audioNodes = {
        inputGainNode: { audioNode: audioContext.createGain() },
        outputGainNode: { audioNode: audioContext.createGain() },
        gainNode: { audioNode: audioContext.createGain() },
        feedbackGainNode: { audioNode: audioContext.createGain() },
        delayNode: { audioNode: audioContext.createDelay() },
        oscillatorNode: { audioNode: audioContext.createOscillator() },
        speed: (value) => {
            module.audioNodes.oscillatorNode.audioNode.frequency.value = value;
        },
        delaytime: (value) => {
            module.audioNodes.delayNode.audioNode.delayTime.value = value;
        },
        feedback: (value) => {
            module.audioNodes.feedbackGainNode.audioNode.gain.value = value;
        },
        depth: (value) => {
            module.audioNodes.gainNode.audioNode.gain.value = value;
        },
    };

    module.audioNodes.oscillatorNode.audioNode.connect(module.audioNodes.gainNode.audioNode);
    module.audioNodes.gainNode.audioNode.connect(module.audioNodes.delayNode.audioNode.delayTime);
    module.audioNodes.inputGainNode.audioNode.connect(module.audioNodes.outputGainNode.audioNode);
    module.audioNodes.inputGainNode.audioNode.connect(module.audioNodes.delayNode.audioNode);
    module.audioNodes.delayNode.audioNode.connect(module.audioNodes.outputGainNode.audioNode);
    module.audioNodes.delayNode.audioNode.connect(module.audioNodes.feedbackGainNode.audioNode);
    module.audioNodes.feedbackGainNode.audioNode.connect(module.audioNodes.inputGainNode.audioNode);

    module.audioNodes.oscillatorNode.audioNode.type = "sine";
    module.audioNodes.oscillatorNode.audioNode.start(0);

    module.audioNodes.input = module.audioNodes.inputGainNode.audioNode;
    module.audioNodes.output = module.audioNodes.outputGainNode.audioNode;

    module.audioNodes.delayNode.audioNode.delayTime.value = initalDelay;
    module.audioNodes.feedbackGainNode.audioNode.gain.value = initalFeedback;
    module.audioNodes.gainNode.audioNode.gain.value = initalDepth;
    module.audioNodes.oscillatorNode.audioNode.frequency.value = initalSpeed;

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();

    event.preventDefault();
}
