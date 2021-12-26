import Player from "../classes/ModulePlayer.js";
import Parameter from "../classes/Parameter.js";
import { audioContext } from "../main.js";

export default function pulseOscillator(event, initalDetune, initalFrequency, initalDuty, initalAmplitude) {
    const type = "sawtooth";
    const duty = parseFloat(initalDuty || 0.5);
    const detune = parseFloat(initalDetune || 0);
    const amplitude = parseFloat(initalAmplitude || 1);
    const frequency = parseFloat(initalFrequency || 110);
    const dutyInfo = "The amount of time the oscillator spends in the high and low part of its cycle";
    const detuneInfo = "Determine how much signal will be played out of tune";
    const amplitudeInfo = "Max amplitude of the oscillator signal";
    const frequencyInfo = "Number of complete cycles a waveform makes in a second";

    const module = new Player("pulse oscillator", type, [type]);

    // create new curve that will transform values [0:127] to -1 and [128:255] to +1
    const squareCurve = new Float32Array(256);
    squareCurve.fill(-1, 0, 127);
    squareCurve.fill(1, 128, 255);

    module.audioNode = {
        oscillatorNode: new OscillatorNode(audioContext, {
            type: type,
            detune: detune,
            frequency: frequency,
        }),
        offsetNode: new ConstantSourceNode(audioContext, { offset: duty }),
        squareShaper: new WaveShaperNode(audioContext, { curve: squareCurve }),
        amplitudeNode: new GainNode(audioContext),
        outputNode: new GainNode(audioContext),
        amplitude: new Parameter(amplitude, (value) => {
            module.audioNode.amplitudeNode.gain.value = value;
        }),
        get duty() {
            return this.offsetNode.offset;
        },
        get type() {
            return this.oscillatorNode.type;
        },
        get detune() {
            return this.oscillatorNode.detune;
        },
        get frequency() {
            return this.oscillatorNode.frequency;
        },
        start(time) {
            const type = String(module.content.options.select.value);
            const duty = parseFloat(module.content.controllers.duty.slider.value);
            const detune = parseFloat(module.content.controllers.detune.slider.value);
            const frequency = parseFloat(module.content.controllers.frequency.value.innerText); //.value is a pointer not returner

            this.oscillatorNode.type = type;
            this.oscillatorNode.detune.value = detune;
            this.oscillatorNode.frequency.value = frequency;

            this.offsetNode.offset.value = duty;

            // reconnect oscillator with another node
            this.oscillatorNode.connect(this.squareShaper);
            this.offsetNode.connect(this.squareShaper);

            this.oscillatorNode.start(time);
            this.offsetNode.start(time);
        },
        stop(time) {
            // don't leave oscillator running in the background
            this.oscillatorNode && this.oscillatorNode.disconnect();
            this.offsetNode && this.offsetNode.disconnect();
            // there is no easy way to know if oscillator is running thus simply stoping it might cause an warning
            this.oscillatorNode = new OscillatorNode(audioContext);
            this.offsetNode = new ConstantSourceNode(audioContext);
        },
        connect(destination) {
            if (destination.inputNode) this.outputNode.connect(destination.inputNode);
            else this.outputNode.connect(destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    module.createSlider("frequency", frequency, 0.1, 2000, 0.01, "Hz", true, frequencyInfo);
    module.createSlider("detune", detune, -1200, 1200, 1, "cts", false, detuneInfo);
    module.createSlider("duty", duty, -1, 2, 0.1, "", false, dutyInfo);
    module.createSlider("amplitude", amplitude, 0, 2, 0.1, "", false, amplitudeInfo);

    module.audioNode.oscillatorNode.connect(module.audioNode.squareShaper);
    module.audioNode.offsetNode.connect(module.audioNode.squareShaper);
    module.audioNode.squareShaper.connect(module.audioNode.amplitudeNode);
    module.audioNode.amplitudeNode.connect(module.audioNode.outputNode);

    // structure needs to be fully build before. GetBoundingClientRect related.
    module.addInitalCable();

    return module;
}
