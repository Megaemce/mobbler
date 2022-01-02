import Player from "../../classes/ModulePlayer.js";
import Parameter from "../../classes/Parameter.js";
import { audioContext } from "../../main.js";

export default function oscillator(event, initalType, initalDetune, initalFrequency, initalAmplitude) {
    const types = ["sine", "square", "sawtooth", "triangle"];
    const type = initalType === undefined ? types[2] : initalType;
    const detune = parseFloat(initalDetune || 0);
    const amplitude = parseFloat(initalAmplitude || 1);
    const frequency = parseFloat(initalFrequency || 110);
    const detuneInfo = "Determine how much signal will be played out of tune";
    const amplitudeInfo = "Max amplitude of the oscillator signal";
    const frequencyInfo = "Number of complete cycles a waveform makes in a second";

    const module = new Player("oscillator", type, types);

    module.audioNode = {
        outputNode: new GainNode(audioContext),
        amplitudeNode: new GainNode(audioContext),
        oscillatorNode: new OscillatorNode(audioContext, {
            type: type,
            detune: detune,
            frequency: frequency,
        }),
        amplitude: new Parameter(amplitude, (value) => {
            module.audioNode.amplitudeNode.gain.value = value;
        }),
        type: new Parameter(type, (value) => {
            module.audioNode.oscillatorNode.type = value;
        }),
        detune: new Parameter(detune, (value) => {
            module.audioNode.oscillatorNode.detune.value = value;
        }),
        frequency: new Parameter(frequency, (value) => {
            module.audioNode.oscillatorNode.frequency.value = value;
        }),
        start(time) {
            // rebuild connection
            this.oscillatorNode.connect(this.amplitudeNode);
            this.amplitudeNode.connect(this.outputNode);
            try {
                this.oscillatorNode.start();
            } catch {
                // oscillator already started
            }
        },
        stop(time) {
            // don't leave oscillator running in the background
            this.oscillatorNode && this.oscillatorNode.disconnect();
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
    module.createSlider("amplitude", amplitude, 0, 2, 0.1, "", false, amplitudeInfo);

    module.audioNode.amplitudeNode.connect(module.audioNode.outputNode);
    module.audioNode.oscillatorNode.connect(module.audioNode.amplitudeNode);

    // changing oscillator type
    module.content.options.select.onchange = function () {
        if (module.audioNode.oscillatorNode) module.audioNode.oscillatorNode.type = this.value;
    };

    // structure needs to be fully build before. GetBoundingClientRect related.
    module.addInitalCable();

    return module;
}
