import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function convolver(event, bufferName, normalizer) {
    const initalBufferName = bufferName || "IR_theater.wav";
    const initalNormalizer = normalizer || false;
    const irNames = Object.keys(audioContext.nameIRBuffer);

    let module = new Module("convolver", true, false, true, irNames);

    // set audioNode with inital values
    module.audioNode = audioContext.createConvolver();
    module.audioNode.buffer = audioContext.nameIRBuffer[initalBufferName];
    module.audioNode.normalize = initalNormalizer;

    module.content.options.select.onchange = function () {
        module.audioNode.buffer = audioContext.nameIRBuffer[this.value];
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
