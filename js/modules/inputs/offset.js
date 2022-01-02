import Player from "../../classes/ModulePlayer.js";
import Parameter from "../../classes/Parameter.js";
import { audioContext } from "../../main.js";

export default function offset(event, initalOffset) {
    const offset = parseFloat(initalOffset || 0.5);
    const offsetInfo = "Amplitude of single unchanging value";

    const module = new Player("offset", undefined, undefined, false, false);

    module.audioNode = {
        outputNode: new GainNode(audioContext),
        offsetNode: new ConstantSourceNode(audioContext),
        offset: new Parameter(offset, (value) => {
            module.audioNode.offsetNode.offset.value = value;
        }),
        start(time) {
            const offset = parseFloat(module.content.controllers.offset.slider.value);
            this.offsetNode.offset.value = offset;

            // reconnect oscillator with output node
            this.offsetNode.connect(this.outputNode);

            try {
                this.offsetNode.start(time);
            } catch {
                // oscillator already started
            }
        },
        stop(time) {
            // don't leave offsetNode running in the background
            this.offsetNode && this.offsetNode.disconnect();
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

    module.audioNode.offsetNode.connect(module.audioNode.outputNode);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
