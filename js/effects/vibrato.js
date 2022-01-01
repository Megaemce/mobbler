import Module from "../classes/Module.js";
import Parameter from "../classes/Parameter.js";
import { audioContext } from "../main.js";

export default function vibrato(event, initalWidth, initalSpeed, initalDelayTime) {
    const width = parseFloat(initalWidth || 0.005);
    const speed = parseFloat(initalSpeed || 3);
    const delayTime = parseFloat(initalDelayTime || 0.01);
    const widthInfo = "Width of the sine wave used in vibrato. More make the sound more distorted";
    const speedInfo = "Frequency of oscillator that makes change in simulated periodic variations of pitch";

    const module = new Module("vibrato", true, false, false, undefined);

    module.audioNode = {
        delayNode: new DelayNode(audioContext, { delayTime: delayTime }),
        inputNode: new GainNode(audioContext),
        outputNode: new GainNode(audioContext),
        depthNode: new GainNode(audioContext, { gain: width }),
        oscillatorNode: audioContext.createOscillator(),
        speed: new Parameter(speed, (value) => {
            module.audioNode.oscillatorNode.frequency.value = value;
        }),
        width: new Parameter(width, (value) => {
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

    module.createSlider("width", width, 0, 0.01, 0.001, "", false, widthInfo);
    module.createSlider("speed", speed, 0, 20, 0.1, "Hz", false, speedInfo);

    module.audioNode.inputNode.connect(module.audioNode.delayNode);
    module.audioNode.delayNode.connect(module.audioNode.outputNode);
    module.audioNode.depthNode.connect(module.audioNode.delayNode.delayTime);
    module.audioNode.oscillatorNode.connect(module.audioNode.depthNode);

    module.audioNode.oscillatorNode.start(0);
    module.audioNode.oscillatorNode.frequency.value = speed;

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
