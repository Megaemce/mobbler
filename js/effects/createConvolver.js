import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function createConvolver(event, initalBufferName, initalNormalizer) {
    let irNames = Object.keys(audioContext.nameIRBuffer);
const bufferName = initalBufferName || irNames[0]
const normalizer = initalNormalizer || "false"

    let module = new Module("convolver", true, false, true, irNames);

    module.audioNode = audioContext.createConvolver();
    module.audioNode.buffer = audioContext.nameIRBuffer[bufferName];
    module.audioNode.normalize = normalizer;

    module.content.options.select.onchange = function () {
        module.audioNode.buffer = audioContext.nameIRBuffer[this.value];
    };

    // create new cable linked with this module. It's done here as the module html
    // structure needs to be fully build before - getBoundingClientRect related.
    module.addInitalCable();

    event.preventDefault();
}
