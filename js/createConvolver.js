import createModule from './createModule.js';
import {
    audioContext,
    impulseResponses,
    irBuffer
}
from './main.js'

// impulse response files

export default function createConvolver() {
    let module = createModule("convolver", true, true, false, true, impulseResponses);
    let select = document.getElementById(`${module.id}-footer-select`)

    module.audioNode = audioContext.createConvolver();
    module.audioNode.buffer = irBuffer[0];

    select.onchange = function () {
        module.audioNode.buffer = irBuffer[this.selectedIndex];
    }

    if (this.event)
        this.event.preventDefault();
}