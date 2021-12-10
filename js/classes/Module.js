import Cable from "./Cable.js";
import { audioContext, cables, modules } from "../main.js";
import { valueToLogPosition, logPositionToValue } from "../helpers/math.js";
import { buildModule, buildModuleSlider, addOpenFileButtonTo, displayAlertOnElement } from "../helpers/builders.js";

let id = 0;

export default class Module {
    constructor(name, hasInput, hasLooper, hasNormalizer, arrayForSelect) {
        this.id = `module-${++id}`;
        this.div = undefined; // keeping link to HTML sctructure
        this.name = name;
        this.zIndex = id;
        this.position = undefined; // module position
        this.hasInput = hasInput === undefined ? true : Boolean(hasInput);
        this.hasLooper = hasLooper === undefined ? false : Boolean(hasLooper);
        this.animationID = {}; // keep animationID of all parameters for Cable.deleteCable() function
        this.hasNormalizer = hasNormalizer === undefined ? false : Boolean(hasNormalizer);
        this.isTransmitting = false;
        this.arrayForSelect = arrayForSelect;
        this.createModule(); // create html's object
    }
    /* return true/false if there is anything actively talking to this module's input  */
    get inputActivity() {
        if (Object.values(cables).find((cable) => cable.destinationID === this.id && cable.inputName === "input" && modules[cable.sourceID].isTransmitting)) {
            return true;
        }
        return false;
    }
    /* return number of incoming cables to the input (not nessesary active). Used by deleteCable() */
    get inputCount() {
        return Object.values(cables).filter((cable) => cable.destinationID === this.id && cable.inputName === "input").length;
    }
    /* return all incoming and outcoming cables linked with this module */
    get relatedCables() {
        return Object.values(cables).filter((cable) => cable.destinationID === this.id || cable.sourceID === this.id);
    }
    /* return all incoming cables linked with this module */
    get incomingCables() {
        return Object.values(cables).filter((cable) => cable.destinationID === this.id);
    }
    /* return all outcoming cables linked with this module */
    get outcomingCables() {
        return Object.values(cables).filter((cable) => cable.sourceID === this.id);
    }
    /* save module position within class and return it */
    get modulePosition() {
        this.position = this.div.getBoundingClientRect();
        return this.position;
    }
    set modulePosition(value) {
        this.position = value;
    }
    /* build module html object and attach all logic into it */
    createModule() {
        const module = this;
        let timerID = undefined;

        buildModule(module);

        // put it on front as a first action
        module.bringToFront();

        // set module upfront when choosen
        module.div.onmousedown = () => {
            module.bringToFront();
        };

        // when title is grabbed move the module
        module.head.titleWrapper.onmousedown = (event) => {
            module.movingModule(event);
        };

        // allow title to be renamed
        module.head.titleWrapper.onmouseover = () => {
            timerID = window.setTimeout(() => {
                module.head.titleWrapper.children[0].setAttribute("contenteditable", true);
                // need to click to rename thus disabling onmousedown handler for a moment
                module.head.titleWrapper.style.cursor = "text";
                module.head.titleWrapper.onmousedown = undefined;
            }, 1500);
        };

        // mouseout thus finishing editing
        module.head.titleWrapper.onmouseout = () => {
            window.clearTimeout(timerID);
            module.head.titleWrapper.children[0].setAttribute("contenteditable", false);
            module.head.titleWrapper.style.cursor = "grab";
            module.head.titleWrapper.onmousedown = (event) => {
                module.movingModule(event);
            };
        };

        // when close button is clicked delete the module
        module.head.close.onclick = () => {
            module.deleteModule();
        };

        // add module to the modules dictionary
        modules[module.id] = module;
    }
    /* build module audio slider html object and attach all logic into it */
    createSlider(property, initialValue, min, max, stepUnits, units, scaleLog, propertyInfo) {
        const module = this;
        const parameterType = property.split(" ").join("");

        let renameTimerID = undefined;
        let debugTimerID = undefined;

        buildModuleSlider(module, property, initialValue, min, max, stepUnits, units, scaleLog, propertyInfo);

        // set inital values on audioNode
        if (module.audioNode) module.audioNode[parameterType].value = initialValue;

        // when slider is moved (by user or by connected module)
        module.content.controllers[parameterType].slider.oninput = function () {
            const sliderValue = scaleLog ? logPositionToValue(this.value, this.min, this.max) : this.value;

            // set value on the audiNode parameter
            if (module.audioNode) module.audioNode[parameterType].value = sliderValue;

            // show new value above slider and in debug
            module.content.controllers[parameterType].value.innerHTML = sliderValue;
            module.content.controllers[parameterType].debug.currentValue.innerText = sliderValue;
        };

        // show slider's debug mode when hovered over value for 1 sec
        module.content.controllers[parameterType].value.onmouseover = () => {
            window.setTimeout(() => {
                module.content.controllers[parameterType].value.style.cursor = "progress";
            }, 300);
            debugTimerID = window.setTimeout(() => {
                module.content.controllers[parameterType].debug.classList.add("show");
                module.content.controllers[parameterType].value.style.cursor = "default";
            }, 1000);
        };

        module.content.controllers[parameterType].value.onmouseout = () => {
            window.clearTimeout(debugTimerID);
        };

        // allow parameter to be renamed
        module.content.controllers[parameterType].info.label.span.onmouseover = () => {
            renameTimerID = window.setTimeout(() => {
                module.content.controllers[parameterType].info.label.span.setAttribute("contenteditable", true);
                module.content.controllers[parameterType].info.label.style.cursor = "text";
            }, 1500);
        };

        // mouseout thus finishing editing
        module.content.controllers[parameterType].info.label.span.onmouseout = () => {
            window.clearTimeout(renameTimerID);
            module.content.controllers[parameterType].info.label.span.setAttribute("contenteditable", false);
            module.content.controllers[parameterType].info.label.style.cursor = "help";
        };
    }
    /* add "open file..." option to select div */
    addOpenFileTo(selectDiv) {
        addOpenFileButtonTo(selectDiv);
    }
    /* cancel slider movement animation on sliderType */
    stopSliderAnimation(sliderType) {
        window.cancelAnimationFrame(this.animationID[sliderType]);
    }
    /* create new cable which is an inital cable */
    addInitalCable() {
        this.initalCable = new Cable(this.id);
    }
    /* check highest zIndex within modules and make choosen module higher */
    bringToFront() {
        let biggestIndex = 0;
        Object.values(modules).forEach((module) => {
            if (module.zIndex >= biggestIndex) biggestIndex = module.zIndex + 1;
        });
        this.zIndex = biggestIndex;
        this.div.style.zIndex = biggestIndex;
    }
    /* depth first search all outcoming cables and mark them as active or deactive */
    markAllLinkedCablesAs(status) {
        let visited = {};
        let stack = this.outcomingCables;

        // stack keeps a list of outcomingCables from this module
        while (stack.length) {
            const cable = stack.pop(); // currently visited cable
            const source = modules[cable.sourceID];
            const destination = modules[cable.destinationID];

            // simply make the cable active
            if (status === "active") {
                cable.makeActive();
            }
            // as the destination is receiving active signal (from this module) mark it as a transmitter too
            // but only if cable is module-to-module not module-to-parameter type
            // also as there is no other easy way: restart all the slider's animation in all it's outcoming
            // cables connected to other module's parameters
            if (status === "active" && cable.inputName === "input" && destination) {
                destination.isTransmitting = true;
                destination.outcomingCables.forEach((cable) => {
                    const cableDestination = modules[cable.destinationID];
                    if (cable.inputName !== "input") {
                        cable.makeActive();
                        destination.connectToParameter(cableDestination, cable.inputName);
                    }
                });
            }
            // simple make the cable deactive if it's source is also death
            if (status === "deactive" && source.isTransmitting === false) {
                cable.makeDeactive();
            }
            // as this cable was module-to-module type and source module is not active anymore,
            // check if there is nothing more actively talking to this module and mark is as inactive
            if (status === "deactive" && cable.inputName === "input" && destination && destination.inputActivity === false) {
                destination.isTransmitting = false;
                // stop animation on visualizer and make it listening on input again
                if (destination.constructor.name === "Visualizer") {
                    destination.resetAnalyser();
                }
            }

            // module-to-parameter cable thus just unlock the slider
            if (status === "deactive" && cable.inputName !== "input" && destination) {
                destination.stopSliderAnimation(cable.inputName);
                destination.content.controllers[cable.inputName].slider.classList.remove("disabled");
            }

            // depth first search section
            if (!visited[cable.id]) {
                visited[cable.id] = true;
                // don't try to do dfs on module-to-parameter cables as destination in those is their mother module thus making
                // further escalation: Source -> Destination's Parameter -> Destination -> Destination's outcominggoing cables
                if (cable.inputName === "input" && destination) {
                    destination.outcomingCables.forEach((cable) => {
                        if (!visited[cable.id]) {
                            stack.push(cable);
                        }
                    });
                }
            }
        }
    }
    /* all logic related to module movement event */
    movingModule(event) {
        const module = this;
        const canvas = document.getElementById("svgCanvas");
        const initalCableModules = Object.values(modules).filter((module) => module.initalCable);

        // update cursor
        canvas.style.cursor = "grabbing";

        // output module doesn't have initalCable
        module.initalCable && module.initalCable.deleteCable();

        // hide all other inital cables so the view stay tidy
        initalCableModules.forEach((module) => {
            module.initalCable.jack.setAttribute("opacity", "0");
            module.initalCable.shape.setAttribute("opacity", "0");
        });

        // start physics on all cables
        module.relatedCables.forEach((cable) => {
            cable.startPhysicsAnimation();
        });

        // update module position and its cables
        document.onmousemove = (event) => {
            // show cables on front while moving modules
            canvas.style.zIndex = module.zIndex + 1;

            // move drag element by the same amount the cursor has moved
            module.div.style.left = parseInt(module.div.style.left) + event.movementX + "px";
            module.div.style.top = parseInt(module.div.style.top) + event.movementY + "px";

            // update any lines that point in here
            module.incomingCables.forEach((cable) => {
                cable.moveEndPointBy(event.movementX, event.movementY);
                module.isTransmitting && cable.makeActive();
            });

            // update any lines that point out of here
            module.outcomingCables.forEach((cable) => {
                cable.moveStartPointBy(event.movementX, event.movementY);
                module.isTransmitting && cable.makeActive();
            });
        };

        // remove listeners after module release
        document.onmouseup = () => {
            canvas.style.zIndex = 0;

            // cancel physic animation on all cables
            module.relatedCables.forEach((cable) => {
                cable.stopPhysicsAnimation();
            });

            // unhide all inital cables
            initalCableModules.forEach((module) => {
                module.initalCable.jack.setAttribute("opacity", "1");
                module.initalCable.shape.setAttribute("opacity", "1");
            });

            // create new inital cable (just for animation purpose)
            if (module.name !== "output" && module.constructor.name !== "Visualizer") {
                module.addInitalCable();
            }

            canvas.style.cursor = "default";
            document.onmousemove = undefined;
            document.onmouseup = undefined;
        };
        event.preventDefault();
    }
    /* move module to given position. Used to showcase module when clicked on its name in mixer */
    moveModule(position) {
        this.div.style.left = parseInt(position.left) + "px";
        this.div.style.top = parseInt(position.top) + "px";
    }
    /* remove module and all related cables */
    deleteModule() {
        const module = this;
        // remove inital cable
        module.initalCable && module.initalCable.deleteCable();

        // mark this module as not active anymore
        module.isTransmitting = false;

        // mark all related cables as inactive
        module.markAllLinkedCablesAs("deactive");

        // remove all related cables
        module.relatedCables.forEach((cable) => {
            cable.deleteCable();
        });

        // execute any module-specific function if there is any
        module.onDeletion && module.onDeletion();

        // remove html object
        module.div.parentNode.removeChild(module.div);

        // remove module from modules
        delete modules[module.id];

        // disconnect audioNode (if there is any active)
        module.audioNode && module.audioNode.disconnect();

        // remove object
        delete this;
    }
    /* connect this module to destinationModule and send information further. 
       destinationModule is always audioNode-enabled */
    connectToModule(destinationModule) {
        // if source module is multiNode effect act differently
        const source = this.audioNode;
        let destination = undefined;
        if (destinationModule.audioNode.inputNode) destination = destinationModule.audioNode.inputNode;
        else destination = destinationModule.audioNode;

        // if this module is transmitting make connection and mark further cables as active
        source && destination && source.connect(destination);

        if (this.isTransmitting) {
            this.markAllLinkedCablesAs("active");
        }

        // change input picture to busy version
        destinationModule.div.input.setAttribute("src", "./img/input_busy.svg");

        // execute function if there is any hooked
        if (destinationModule.onConnectInput) {
            destinationModule.onConnectInput(this);
        }
    }
    /* connect this module to destinationModule's slider of parameterType. 
       destinationModule is always audioNode-enabled */
    connectToSlider(destinationModule, slider, parameterType, initalSliderValue) {
        const module = this;
        const dataMin = -1;
        const dataMax = 1;
        const sliderMin = parseFloat(slider.min);
        const sliderMax = parseFloat(slider.max);
        const volumeData = new Float32Array(slider.audioNode.fftSize); // slider.audioNode's getByteTimeDomainData values in range dataMin-dataMax
        const initalValueDeviation = parseFloat(initalSliderValue - (sliderMin + sliderMax / 2)); // deviation from the slider's middle point
        const average = (array) => array.reduce((a, b) => a + b, 0) / array.length; // return avarage of elements from array;

        let scaledValue; // value scaled between volumeData range (dataMin-dataMax) to sliderMin-sliderMax

        // load analyser data into volumeData
        slider.audioNode.getFloatTimeDomainData(volumeData);

        scaledValue = ((sliderMax - sliderMin) * (average(volumeData) - dataMin)) / (dataMax - dataMin) + sliderMin;

        // input value will always have 0 in the middle of the slider thus move it according to the inital slider value
        scaledValue = scaledValue + initalValueDeviation;

        // now value can be higher than the max or lower than min thus cut it
        if (scaledValue < sliderMin) scaledValue = sliderMin;
        if (scaledValue > sliderMax) scaledValue = sliderMax;

        // change slider position if scaleLog option is enabled
        slider.value = slider.scaleLog ? valueToLogPosition(scaledValue, sliderMin, sliderMax) : scaledValue;

        // custom Parameter don't control audio thus just set the new value (they know what to do next)
        if (destinationModule.audioNode && destinationModule.audioNode[parameterType].constructor.name === "Parameter") {
            destinationModule.audioNode[parameterType].value = scaledValue;
        }

        destinationModule.content.controllers[parameterType].value.innerHTML = slider.value;
        destinationModule.content.controllers[parameterType].debug.currentValue.innerText = slider.value;

        // update the value inifinite but only if module is actively transmitting
        destinationModule.animationID[parameterType] = requestAnimationFrame(() => {
            if (module.isTransmitting === false) return;
            module.connectToSlider(destinationModule, slider, parameterType, initalSliderValue);
        });
    }
    /* connect this module's analyser to destinationModule's slider of parameterType 
       destinationModule can have audioNode missing */
    connectToParameter(destinationModule, parameterType) {
        const module = this;
        const slider = destinationModule.content.controllers[parameterType].slider;

        // is source is active mark cable as active and slider as disabled
        if (module.isTransmitting) {
            slider.classList.add("disabled");
        } else {
            slider.classList.remove("disabled");
        }

        // change input picture to busy version
        destinationModule.footer[parameterType].img.setAttribute("src", "./img/parameter_input_busy.svg");

        // not connecting directly source to parameter but to the analyser and then to destination's parameter slider
        if (slider && module.audioNode) {
            if (!slider.audioNode) {
                slider.audioNode = new AnalyserNode(audioContext);
                slider.audioNode.fftSize = 32;
            }

            // used by envelope
            slider.audioNode.parentID = destinationModule.id;
            slider.audioNode.parameterType = parameterType;

            // connect only to "AudioParam" parameters as they control actual audio rather than "Parameter"
            if (destinationModule.audioNode && destinationModule.audioNode[parameterType].constructor.name !== "Parameter") {
                module.audioNode.connect(destinationModule.audioNode[parameterType]);
            }

            // connect just for slider-animation controlled by analyser
            module.audioNode.connect(slider.audioNode);

            // don't make unnesessary slider's animation if source module is not active
            module.isTransmitting && module.connectToSlider(destinationModule, slider, parameterType, slider.value);
        }
    }
}
