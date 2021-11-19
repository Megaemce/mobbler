import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function convolver(event, initalBufferName, initalNormalizer) {
    const bufferName = initalBufferName || "IR_theater.wav";
    const normalizer = initalNormalizer || false;
    const irNames = Object.keys(audioContext.nameIRBuffer);

    let module = new Module("convolver", true, false, true, irNames);

    // set audioNode with inital values
    module.audioNode = audioContext.createConvolver();
    module.audioNode.buffer = audioContext.nameIRBuffer[bufferName];
    module.audioNode.normalize = normalizer;

    module.content.options.select.onchange = function () {
        module.audioNode.buffer = audioContext.nameIRBuffer[this.value];
    };

    // when normalizer is changed switch audioNode.normalize status
    module.content.options.normalizer.checkbox.onchange = () => {
        module.audioNode.normalize = module.content.options.normalizer.checkbox.checked;
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
