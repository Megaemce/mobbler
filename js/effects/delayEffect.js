import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function delayEffect(event, initalWetness, initalDelay, initalFeedback) {
    const delay = initalDelay || 0.1;
    const wetness = initalWetness || 0.3;
    const feedback = initalFeedback || 0.8;
    const delayInfo = "Number of seconds from input signal to be storage and play back";
    const wetnessInfo = "Loudness of signal with full amount of an effect";
    const feedbackInfo = "The return of a portion of the output signal back into delay loop";

    let module = new Module("delay effect", true, false, false, undefined, true);

    module.audioNode = {
        inputNode: audioContext.createGain(),
        outputNode: audioContext.createGain(),
        wetNode: audioContext.createGain(), // wetness of the delay
        durationNode: audioContext.createGain(), // duration of the delay
        delayNode: audioContext.createDelay(),
        get wetness() {
            return this.wetNode.gain;
        },
        set wetness(value) {
            this.wetNode.gain.value = value;
        },
        get delaytime() {
            return this.delayNode.delayTime;
        },
        set delaytime(value) {
            this.delayNode.delayTime.value = value;
        },
        get feedback() {
            return this.durationNode.gain;
        },
        set feedback(value) {
            this.durationNode.gain.value = value;
        },
    };

    module.createSlider("wetness", wetness, 0, 5, 0.1, "", false, wetnessInfo);
    module.createSlider("delay time", delay, 0, 1, 0.1, "sec", false, delayInfo);
    module.createSlider("feedback", feedback, 0, 1, 0.1, "sec", false, feedbackInfo);

    module.audioNode.inputNode.connect(module.audioNode.wetNode);
    module.audioNode.wetNode.connect(module.audioNode.outputNode);
    module.audioNode.inputNode.connect(module.audioNode.delayNode);
    module.audioNode.delayNode.connect(module.audioNode.durationNode);
    module.audioNode.durationNode.connect(module.audioNode.delayNode);
    module.audioNode.delayNode.connect(module.audioNode.outputNode);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
