import Module from "../classes/Module.js";
import { audioContext } from "../main.js";
import { openFileHandler } from "../helpers/loaders.js";

export default function convolver(event, initalBufferName, initalNormalizer) {
    const bufferName = String(initalBufferName || "IR_theater.wav");
    const normalizer = initalNormalizer === undefined ? false : Boolean(initalNormalizer);
    const irNames = Object.keys(audioContext.nameIRBuffer);

    const module = new Module("convolver", true, false, true, irNames);

    // set audioNode with inital values
    module.audioNode = new ConvolverNode(audioContext, {
        buffer: audioContext.nameIRBuffer[bufferName],
        disableNormalization: !normalizer,
    });

    // after this openFile will be accessible via module.content.options.select.fileButton
    module.addOpenFileTo(module.content.options.select);

    module.content.options.select.onchange = function (event) {
        // when new option is added (eg. after new file loaded) this onchange event get trigger too
        // srcElement.id is only defined when if it was triggered by file button (eg. loading file)
        if (!event.srcElement.id) {
            // when selected option is an file button start openFileHandler
            if (this[this.selectedIndex].id === "file button") {
                // add hooker to the fileButton and then start it by click event
                module.content.options.select.fileButton.input.onchange = () => {
                    openFileHandler(module, "ir");
                };
                module.content.options.select.fileButton.input.click();
            } else {
                // just regular switching thus change IR
                module.audioNode.buffer = audioContext.nameIRBuffer[this.value];
            }
        }
    };

    // when normalizer is changed switch audioNode.normalize status
    module.content.options.normalizer.checkbox.onchange = () => {
        module.audioNode.normalize = module.content.options.normalizer.checkbox.checked;
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
