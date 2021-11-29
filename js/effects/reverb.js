import Module from "../classes/Module.js";
import { audioContext } from "../main.js";
import { openFileHandler } from "../helpers/loaders.js";

export default function reverb(event, initalDryness, initalWetness, initalBufferName) {
    const irNames = Object.keys(audioContext.nameIRBuffer);
    const dryness = parseFloat(initalDryness || 0.5);
    const wetness = parseFloat(initalWetness || 1);
    const bufferName = String(initalBufferName || irNames[0]);
    const drynessInfo = "Loudness of signal without any signal processing";
    const wetnessInfo = "Loudness of signal with full amount of an effect";

    const module = new Module("reverb", true, false, false, irNames);

    module.audioNode = {
        inputNode: new GainNode(audioContext),
        convolerNode: new ConvolverNode(audioContext, {
            buffer: audioContext.nameIRBuffer[bufferName],
        }),
        wetnessNode: new GainNode(audioContext),
        drynessNode: new GainNode(audioContext),
        outputNode: new GainNode(audioContext),
        get dryness() {
            return this.drynessNode.gain;
        },
        set dryness(value) {
            this.drynessNode.gain.value = value;
        },
        get wetness() {
            return this.wetnessNode.gain;
        },
        set wetness(value) {
            this.wetnessNode.gain.value = value;
        },
        connect(destination) {
            this.outputNode.connect(destination.inputNode ? destination.inputNode : destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    module.createSlider("dryness", dryness, 0, 5, 0.1, "", false, drynessInfo);
    module.createSlider("wetness", wetness, 0, 5, 0.1, "", false, wetnessInfo);

    module.audioNode.inputNode.connect(module.audioNode.convolerNode);
    module.audioNode.inputNode.connect(module.audioNode.drynessNode);
    module.audioNode.convolerNode.connect(module.audioNode.wetnessNode);
    module.audioNode.wetnessNode.connect(module.audioNode.outputNode);
    module.audioNode.drynessNode.connect(module.audioNode.outputNode);

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
                module.audioNode.convolerNode.buffer = audioContext.nameIRBuffer[this.value];
            }
        }
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
