import Player from "../classes/ModulePlayer.js";

export default function oscillator(event, initalType, initalDetune, initalFrequency) {
    const types = ["sine", "square", "sawtooth", "triangle"];
    const type = initalType === undefined ? types[0] : initalType;
    const detune = parseFloat(initalDetune || 0);
    const frequecy = parseFloat(initalFrequency || 440);
    const detuneInfo = "Determine how much signal will be played out of tune";
    const frequencyInfo = "Number of complete cycles a waveform makes in a second";

    const module = new Player("oscillator", type, types);

    module.createSlider("frequency", frequecy, 0.1, 2000, 0.01, "Hz", true, frequencyInfo);
    module.createSlider("detune", detune, -1200, 1200, 1, "cents", false, detuneInfo);

    // changing oscillator type
    module.content.options.select.onchange = function () {
        if (module.audioNode) module.audioNode.type = this.value;
    };

    // structure needs to be fully build before. GetBoundingClientRect related.
    module.addInitalCable();
}
