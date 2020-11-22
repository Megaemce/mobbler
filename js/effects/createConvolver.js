import createModule from '../structure/createModule.js';
import audioContext from '../main.js'

export default function createConvolver(event, initalBufferName, initalNormalizer) {
    let irNames = Object.keys(audioContext.nameIRBuffer);
    let module = createModule("convolver", true, false, true, irNames);

    module.audioNode = audioContext.createConvolver();
    module.audioNode.buffer = audioContext.nameIRBuffer[initalBufferName];
    module.audioNode.normalize = initalNormalizer;

    module.content.options.select.onchange = function () {
        module.audioNode.buffer = audioContext.nameIRBuffer[this.value];
    }

    event.preventDefault();
}