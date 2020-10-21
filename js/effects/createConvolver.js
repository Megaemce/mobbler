import createModule from '../structure/createModule.js';
import {
    audioContext,
    impulseResponses,
    irBuffer
}
from '../main.js'

export default function createConvolver(event, initalBufferIndex, initalNormalizer) {
    let module = createModule("convolver", true, true, false, true, impulseResponses);
    let select = document.getElementById(`${module.id}-footer-select`)

    module.audioNode = audioContext.createConvolver();
    module.audioNode.buffer = irBuffer[initalBufferIndex];
    module.audioNode.normalize = initalNormalizer;

    select.onchange = function () {
        module.audioNode.buffer = irBuffer[this.selectedIndex];
    }

    event.preventDefault();
}