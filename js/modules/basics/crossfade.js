import Module from "../../classes/Module.js";
import Parameter from "../../classes/Parameter.js";
import { audioContext, modules } from "../../main.js";

export default function crossfade(event, initalRatio) {
    const ratio = parseFloat(initalRatio || 50);
    const ratioInfo = "Crossfade ratio between track one and two. 0 is full first, 100 is full second";

    const module = new Module("crossfade", true, false, false, undefined);

    module.audioNode = {
        inputNode: new DelayNode(audioContext), // just fake one for the sake of connectToModule()
        firstInputNode: new GainNode(audioContext),
        secondInputNode: new GainNode(audioContext),
        outputNode: new GainNode(audioContext),
        firstModule: undefined, // keeping ref to the module as they might still not be active (audioNode undefined)
        secondModule: undefined,
        ratio: new Parameter(ratio, (value) => {
            if (module.inputCount === 2) {
                // taken from: https://www.html5rocks.com/en/tutorials/webaudio/intro/#toc-xfade
                const x = parseInt(value) / parseInt(100);
                // Use an equal-power crossfading curve:
                const gain1 = Math.cos((1.0 - x) * 0.5 * Math.PI);
                const gain2 = Math.cos(x * 0.5 * Math.PI);

                module.audioNode.firstInputNode.gain.value = gain1;
                module.audioNode.secondInputNode.gain.value = gain2;
            } else if (module.inputCount < 2) {
                // displayAlertOnElement("Add another incoming sound. Two are needed", module.head, 3);
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

    // as there is no proper connect() function in multi audio nodes...
    module.onInputConnected = (source) => {
        if (source.isTransmitting) {
            // if first slot is free or first module was just restarted (stop/play)
            if (module.firstModule === undefined || source === module.firstModule) {
                module.firstModule = source;
                source.audioNode.connect(module.audioNode.firstInputNode);

                return;
            }
            // if second is free or second module was just restarted
            if (module.secondModule === undefined || source === module.secondModule) {
                module.secondModule = source;
                source.audioNode.connect(module.audioNode.secondInputNode);

                return;
            }
            // assign last module to the first slot and new one to the second
            // but don't try to add module which has been just temporary stopped
            if (source !== module.secondModule && source !== module.firstModule) {
                // disconnect previous input owner cable from this effect
                // cleanup first module connections to input and firstInputNode
                module.firstModule.outcomingCables.forEach((cable) => {
                    if (cable.destinationID === module.id && cable.inputName === "input") {
                        if (modules[cable.sourceID].audioNode) {
                            modules[cable.sourceID].audioNode.disconnect(module.audioNode.firstInputNode);
                            modules[cable.sourceID].audioNode.disconnect(module.audioNode.inputNode);
                        }
                        cable.deleteCable();
                    }
                });
                // disconnect second module as it will be connected again in a minute but as a firstModule
                module.secondModule.outcomingCables.forEach((cable) => {
                    if (cable.destinationID === module.id && cable.inputName === "input") {
                        if (modules[cable.sourceID].audioNode) {
                            modules[cable.sourceID].audioNode.disconnect(module.audioNode.secondInputNode);
                            modules[cable.sourceID].audioNode.disconnect(module.audioNode.inputNode);
                        }
                    }
                });
                // switch positions
                module.firstModule = module.secondModule;
                module.firstModule.audioNode && module.firstModule.audioNode.connect(module.audioNode.firstInputNode);

                module.secondModule = source;
                source.audioNode.connect(module.audioNode.secondInputNode);
            }
        }
    };

    module.createSlider("ratio", ratio, 0, 100, 1, "", false, ratioInfo);

    module.audioNode.firstInputNode.connect(module.audioNode.outputNode);
    module.audioNode.secondInputNode.connect(module.audioNode.outputNode);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
