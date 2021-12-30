import Module from "../classes/Module.js";
import Parameter from "../classes/Parameter.js";
import { audioContext } from "../main.js";
import { displayAlertOnElement } from "../helpers/builders.js";

export default function crossfade(event, initalRatio) {
    const ratio = parseFloat(initalRatio || 50);
    const ratioInfo = "Crossfade ratio between track one and two. 0 is full first, 100 is full second";

    const module = new Module("crossfade", true, false, false, undefined);

    module.audioNode = {
        inputNode: new GainNode(audioContext), // just fake one for the sake of connectToModule()
        firstInputNode: new GainNode(audioContext),
        secondInputNode: new GainNode(audioContext),
        outputNode: new GainNode(audioContext),
        firstModule: undefined, // keeping ref to the module as they might still not be active (audioNode undefined)
        secondModule: undefined,
        firstTaken: false, // checking if first input is connected
        secondTaken: false, // checking if second input is connected
        ratio: new Parameter(ratio, (value) => {
            if (module.inputCount === 2) {
                // taken from: https://www.html5rocks.com/en/tutorials/webaudio/intro/#toc-xfade
                const x = parseInt(value) / parseInt(100);
                // Use an equal-power crossfading curve:
                const gain1 = Math.cos((1.0 - x) * 0.5 * Math.PI);
                const gain2 = Math.cos(x * 0.5 * Math.PI);

                console.log(gain1);
                console.log(gain2);

                module.audioNode.firstInputNode.gain.value = gain1;
                module.audioNode.secondInputNode.gain.value = gain2;
            } else if (module.inputCount < 2) {
                displayAlertOnElement("Add another incoming sound. Two are needed", module.head, 3);
            }
        }),
        connect(destination) {
            if (destination.inputNode) this.outputNode.connect(destination.inputNode);
            else this.outputNode.connect(destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    // this will be executed before onInputActivated (always)
    module.onInputConnected = (source) => {
        // if first is free then assign there
        if (module.audioNode.firstTaken === false) {
            module.audioNode.firstModule = source;
            module.audioNode.firstTaken = true;
        } // if second is free then assign there
        else if (module.audioNode.secondTaken === false) {
            module.audioNode.secondModule = source;
            module.audioNode.secondTaken = true;
        } // overwrite first with second and assign new to the second
        else {
            module.audioNode.firstModule = module.audioNode.secondModule;
            module.audioNode.secondModule = source;
        }
    };

    module.onInputActivated = (source) => {
        if (source === module.audioNode.firstModule) {
            source.audioNode.connect(module.audioNode.firstInputNode);
            module.audioNode.firstInputNode.connect(module.audioNode.outputNode);
        }
        if (source === module.audioNode.secondModule) {
            source.audioNode.connect(module.audioNode.secondInputNode);
            module.audioNode.secondInputNode.connect(module.audioNode.outputNode);
        }
    };

    module.createSlider("ratio", ratio, 0, 100, 1, "", false, ratioInfo);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
