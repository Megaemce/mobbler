import Player from "../classes/ModulePlayer.js";
import { audioContext } from "../main.js";

export default function offset(event, initalOffset) {
    const offset = parseFloat(initalOffset || 0.5);
    const offsetInfo = "Amplitude of single unchanging value";

    const module = new Player("offset", undefined, undefined, false, false);

    module.audioNode = new ConstantSourceNode(audioContext);

    module.audioNode = {
        outputNode: new GainNode(audioContext),
        offsetNode: new ConstantSourceNode(audioContext),
        get offset() {
            return this.offsetNode.offset;
        },
        start(time) {
            const offset = parseFloat(module.content.controllers.offset.slider.value);
            this.offsetNode.offset.value = offset;

            // reconnect oscillator with output node
            this.offsetNode.connect(this.outputNode);

            this.offsetNode.start(time);
        },
        stop(time) {
            // don't leave offsetNode running in the background
            this.offsetNode && this.offsetNode.disconnect();
            // same issue like in oscilloscope - there is no easy way to know if it's running
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

    module.createSlider("offset", offset, -2, 2, 0.1, "", false, offsetInfo);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
