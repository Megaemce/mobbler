import Module from "../classes/Module.js";
import Parameter from "../classes/Parameter.js";
import { audioContext } from "../main.js";

export default function equalizer(event, initialBandWidth) {
    const bandWidth = parseFloat(initialBandWidth || 3);
    const bandWidthInfo = "Controls the width of the frequency band. The greater the value, the larger the frequency band";
    const gain125HzInfo = "Boost or an attenuation of frequency 125 Hz";
    const gain250HzInfo = "Boost or an attenuation of frequency 250 Hz";
    const gain500HzInfo = "Boost or an attenuation of frequency 500 Hz";
    const gain1000HzInfo = "Boost or an attenuation of frequency 1000 Hz";
    const gain2000HzInfo = "Boost or an attenuation of frequency 2000 Hz";
    const gain4000HzInfo = "Boost or an attenuation of frequency 4000 Hz";
    const gain8000HzInfo = "Boost or an attenuation of frequency 8000 Hz";

    const module = new Module("equalizer", true, false, false, undefined);

    module.audioNode = {
        inputNode: new GainNode(audioContext),
        outputNode: new GainNode(audioContext),
        hz125Node: new BiquadFilterNode(audioContext, { type: "lowshelf", gain: 0, frequency: 125 }),
        hz250Node: new BiquadFilterNode(audioContext, { type: "peaking", gain: 0, frequency: 250, Q: 1 / bandWidth }),
        hz500Node: new BiquadFilterNode(audioContext, { type: "peaking", gain: 0, frequency: 500, Q: 1 / bandWidth }),
        hz1000Node: new BiquadFilterNode(audioContext, { type: "peaking", gain: 0, frequency: 1000, Q: 1 / bandWidth }),
        hz2000Node: new BiquadFilterNode(audioContext, { type: "peaking", gain: 0, frequency: 2000, Q: 1 / bandWidth }),
        hz4000Node: new BiquadFilterNode(audioContext, { type: "peaking", gain: 0, frequency: 4000, Q: 1 / bandWidth }),
        hz8000Node: new BiquadFilterNode(audioContext, { type: "highshelf", gain: 0, frequency: 8000 }),
        bandWidth: new Parameter(bandWidth, (value) => {
            // in peaking type the lower Q is the bigger frequency band
            module.audioNode.hz250Node.Q.value = 1 / value;
            module.audioNode.hz500Node.Q.value = 1 / value;
            module.audioNode.hz1000Node.Q.value = 1 / value;
            module.audioNode.hz2000Node.Q.value = 1 / value;
            module.audioNode.hz4000Node.Q.value = 1 / value;
        }),
        get _125Hz() {
            return this.hz125Node.gain;
        },
        get _250Hz() {
            return this.hz250Node.gain;
        },
        get _500Hz() {
            return this.hz500Node.gain;
        },
        get _1000Hz() {
            return this.hz1000Node.gain;
        },
        get _2000Hz() {
            return this.hz2000Node.gain;
        },
        get _4000Hz() {
            return this.hz4000Node.gain;
        },
        get _8000Hz() {
            return this.hz8000Node.gain;
        },
        connect(destination) {
            if (destination.inputNode) this.outputNode.connect(destination.inputNode);
            else this.outputNode.connect(destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    module.createSlider("_125 Hz", 0, -8, 8, 0.1, "dB", false, gain125HzInfo);
    module.createSlider("_250 Hz", 0, -8, 8, 0.1, "dB", false, gain250HzInfo);
    module.createSlider("_500 Hz", 0, -8, 8, 0.1, "dB", false, gain500HzInfo);
    module.createSlider("_1000 Hz", 0, -8, 8, 0.1, "dB", false, gain1000HzInfo);
    module.createSlider("_2000 Hz", 0, -8, 8, 0.1, "dB", false, gain2000HzInfo);
    module.createSlider("_4000 Hz", 0, -8, 8, 0.1, "dB", false, gain4000HzInfo);
    module.createSlider("_8000 Hz", 0, -8, 8, 0.1, "dB", false, gain8000HzInfo);
    module.createSlider("band Width", bandWidth, 0.1, 5, 0.1, "", false, bandWidthInfo);

    module.audioNode.inputNode.connect(module.audioNode.hz8000Node);
    module.audioNode.hz8000Node.connect(module.audioNode.hz4000Node);
    module.audioNode.hz4000Node.connect(module.audioNode.hz2000Node);
    module.audioNode.hz2000Node.connect(module.audioNode.hz1000Node);
    module.audioNode.hz1000Node.connect(module.audioNode.hz500Node);
    module.audioNode.hz500Node.connect(module.audioNode.hz250Node);
    module.audioNode.hz250Node.connect(module.audioNode.hz125Node);
    module.audioNode.hz125Node.connect(module.audioNode.outputNode);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
