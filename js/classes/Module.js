import Cable from "./Cable.js";
import { audioContext, cables, modules } from "../main.js";
import { valueToLogPosition, scaleBetween, logPositionToValue } from "../helpers/math.js";
import { buildModule, buildModuleSlider } from "../helpers/builders.js";

/* ======TO DO========

   ===================*/

let id = 0;

export default class Module {
    constructor(name, hasInput, hasLooper, hasNormalizer, arrayForSelect) {
        this.name = name;
        this.hasLooper = hasLooper;
        this.hasInput = hasInput;
        this.hasNormalizer = hasNormalizer;
        this.arrayForSelect = arrayForSelect;
        this.position = undefined; // module's position
        this.div = undefined; // keeping link to HTML sctructure
        this.id = `module-${++id}`;
        this.zIndex = id;
        this.isTransmitting = false;
        this.animationID = {}; // keep animationID of all parameters for Cable.deleteCable() function
        this.createModule(); // create html's object
    }
    /* return true/false if there is anything actively talking to this module  */
    get inputActivity() {
        if (Object.values(cables).find((cable) => cable.destination === this && cable.source.isTransmitting)) {
            return true;
        }
        return false;
    }
    /* return parameters status dictionary with key: cable.type, value: true/false */
    get parametersActivity() {
        let parametersWithStatus = new Object();

        Object.values(cables).forEach((cable) => {
            if (cable.destination === this && cable.type !== "input") {
                if (cable.source.isTransmitting) {
                    parametersWithStatus[cable.type] = true;
                } else {
                    parametersWithStatus[cable.type] = false;
                }
            }
        });

        return parametersWithStatus;
    }
    /* return all incoming and outcoming cables linked with this module */
    get relatedCables() {
        return Object.values(cables).filter((cable) => cable.destination === this || cable.source === this);
    }
    /* return all incoming cables linked with this module */
    get incomingCables() {
        return Object.values(cables).filter((cable) => cable.destination === this);
    }
    /* return all outcoming cables linked with this module */
    get outcomingCables() {
        return Object.values(cables).filter((cable) => cable.source === this);
    }
    /* save module position within class and return it */
    get modulePosition() {
        this.position = this.div.getBoundingClientRect();
        return this.position;
    }
    /* build module html object and attach all logic into it */
    createModule() {
        buildModule(this);

        // set choosen module upfront
        this.div.onmousedown = () => {
            this.bringToFront();
        };

        // when title is grabbed move the module
        this.head.titleWrapper.onmousedown = (event) => {
            this.movingModule(event);
        };

        // when close button is clicked delete the module
        this.head.close.onclick = () => {
            this.deleteModule();
        };

        // when looper checkbox is changed play in a loop/stop the sound
        if (this.hasLooper) {
            this.content.options.looper.checkbox.onchange = () => {
                this.playButtonHandler();
            };
        }

        // when normalizer is changed switch audioNode.normalize status
        if (this.hasNormalizer) {
            this.content.options.normalizer.checkbox.onchange = () => {
                this.audioNode.normalize = this.content.options.normalizer.checkbox.checked;
            };
        }

        // add module to the modules dictionary
        modules[this.id] = this;
    }
    /* build module slider html object and attach all logic into it */
    createSlider(property, initialValue, min, max, stepUnits, units, scaleLog) {
        let propertyNoSpaces = property.split(" ").join("");
        let module = this;

        buildModuleSlider(module, property, initialValue, min, max, stepUnits, units, scaleLog);

        // when slider is moved (by user or by connected module)
        this.content.controllers[propertyNoSpaces].slider.oninput = function () {
            let sliderValue = scaleLog ? logPositionToValue(this.value, min, max) : this.value;

            // set value on the audiNode parametetr
            if (module.audioNode) module.audioNode[propertyNoSpaces].value = sliderValue;
            else if (module.audioNodes) module.audioNodes[propertyNoSpaces](sliderValue);

            // show new value above slider
            module.content.controllers[propertyNoSpaces].info.valueUnit.value.innerHTML = sliderValue;
        };
    }
    /* cancel slider movement animation on sliderType */
    stopSliderAnimation(sliderType) {
        window.cancelAnimationFrame(this.animationID[sliderType]);
    }

    /* create new cable which is an inital cable */
    addInitalCable() {
        this.initalCable = new Cable(this);
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
        let currentCable = undefined;
        let stack = this.outcomingCables;

        // stack keeps a list of outcomingCables from this module
        while (stack.length) {
            currentCable = stack.pop();

            // simply make the cable active
            if (status === "active") {
                currentCable.makeActive();
            }
            // as the destination is receiving active signal (from this module) mark it as a transmitter too
            // but only if cable is module-to-module not module-to-parameter type
            if (status === "active" && currentCable.type === "input") {
                currentCable.destination.isTransmitting = true;
            }
            // simply make the cable deactive
            if (status === "deactive") {
                currentCable.makeDeactive();
            }

            // as this cable was module-to-module type and source module is not active anymore,
            // check if there is nothing more actively talking to this module and mark is as inactive
            if (status === "deactive" && currentCable.type === "input" && currentCable.destination.inputActivity === false) {
                currentCable.destination.isTransmitting = false;
            }
            // module-to-parameter cable thus just unlock the slider
            if (status === "deactive" && currentCable.type !== "input") {
                currentCable.destination.stopSliderAnimation(currentCable.type);
                currentCable.destination.content.controllers[currentCable.type].slider.classList.remove("disabled");
            }

            // depth first search section
            if (!visited[currentCable.id]) {
                visited[currentCable.id] = true;
                // don't try to do dfs on output nor module-to-parameter cable
                if (currentCable.destination.name !== "output" && currentCable.type === "input") {
                    currentCable.destination.outcomingCables.forEach((cable) => {
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
        let canvas = document.getElementById("svgCanvas");
        let initalCableModules = Object.values(modules).filter((module) => module.initalCable);

        // output module doesn't have initalCable
        this.initalCable && this.initalCable.deleteCable();

        // hide all other inital cables so the view stay tidy
        initalCableModules.forEach((module) => {
            module.initalCable.jack.setAttribute("opacity", "0");
            module.initalCable.shape.setAttribute("opacity", "0");
        });

        // start physics on all cables
        this.relatedCables.forEach((cable) => {
            cable.startPhysicsAnimation();
        });

        // Update module's position and its cables
        document.onmousemove = (event) => {
            // show cables on front while moving modules
            canvas.style.zIndex = this.zIndex + 1;

            // move drag element by the same amount the cursor has moved
            this.div.style.left = parseInt(this.div.style.left) + event.movementX + "px";
            this.div.style.top = parseInt(this.div.style.top) + event.movementY + "px";

            // update any lines that point in here
            this.incomingCables.forEach((cable) => {
                cable.moveEndPoint(event.movementX, event.movementY);
                this.isTransmitting && cable.makeActive();
            });

            // update any lines that point out of here
            this.outcomingCables.forEach((cable) => {
                cable.moveStartPoint(event.movementX, event.movementY);
                this.isTransmitting && cable.makeActive();
            });
        };

        // remove listeners after module release
        document.onmouseup = () => {
            canvas.style.zIndex = 0;

            // cancel physic animation on all cables
            this.relatedCables.forEach((cable) => {
                cable.stopPhysicsAnimation();
            });

            // unhide all inital cables
            initalCableModules.forEach((module) => {
                module.initalCable.jack.setAttribute("opacity", "1");
                module.initalCable.shape.setAttribute("opacity", "1");
            });

            // create new inital cable (just for animation purpose)
            this.name !== "output" && this.addInitalCable();

            document.onmousemove = undefined;
            document.onmouseup = undefined;
        };
        event.preventDefault();
    }
    /* remove module and all related cables */
    deleteModule() {
        // remove inital cable
        this.initalCable && this.initalCable.deleteCable();

        // mark this module as not active anymore
        this.isTransmitting = false;

        // mark all related cables as inactive
        this.markAllLinkedCablesAs("deactive");

        // remove all related cables
        this.relatedCables.forEach((cable) => {
            cable.deleteCable();
        });

        // execute any module-specific function if there is any
        this.onDeletion && this.onDeletion(); // currently not used

        // remove html object
        this.div.parentNode.removeChild(this.div);

        // remove module from modules
        delete modules[this.id];

        // disconnect audioNode
        this.audioNode.disconnect();

        // remove audioNode
        this.audioNode = undefined;

        // remove object
        delete this;
    }
    /* connect this module to destinationModule and send information further */
    connectToModule(destinationModule) {
        let source = undefined;
        let destination = undefined;

        // if source module is multi-node effect act differently
        if (this.audioNodes) source = this.audioNodes.output;
        else if (this.audioNode) source = this.audioNode;

        // if destination module is multi-node effect act differently
        if (destinationModule.audioNodes) destination = destinationModule.audioNodes.input;
        else if (destinationModule.audioNode) destination = destinationModule.audioNode;

        // if this module is transmitting make connection and mark further cables as active
        if (this.isTransmitting) {
            source.connect(destination);
            this.markAllLinkedCablesAs("active");
        }

        // execute function if there is any hooked
        if (destinationModule.onConnectInput) {
            destinationModule.onConnectInput();
        }
    }
    /* connect this module to destinationModule's slider of parameterType */
    connectToSlider(destinationModule, slider, parameterType) {
        // slider.audioNode.fftSize default vaue is 2048
        let dataArray = new Uint8Array(slider.audioNode.fftSize);

        slider.audioNode.getByteTimeDomainData(dataArray);

        // performance tweak - just get the max value of array instead of iterating
        let element = Math.max(...dataArray);
        let scaledValue = scaleBetween(element, 0, 255, slider.minFloat, slider.maxFloat);

        slider.value = slider.scaleLog ? valueToLogPosition(scaledValue, slider.minFloat, slider.maxFloat) : scaledValue;

        // if destination is regular module get parameter via audioNode[type]
        if (destinationModule.audioNode) destinationModule.audioNode[parameterType].value = slider.value;
        // if destination is multi-node module get parameter value differently via audioNodes[type]
        else if (destinationModule.audioNodes) destinationModule.audioNodes[parameterType].value = slider.value;

        destinationModule.content.controllers[parameterType].value.innerHTML = scaledValue;

        // update the value inifinite
        destinationModule.animationID[parameterType] = requestAnimationFrame(() => {
            this.connectToSlider(destinationModule, slider, parameterType);
        });
    }
    /* connect this module into analyser and next to destinationModule's slider of parameterType */
    connectToParameter(destinationModule, parameterType) {
        let slider = destinationModule.content.controllers[parameterType].slider;

        // is source is active mark cable as active and slider as disabled
        if (this.isTransmitting) {
            // mark cable that is currently used as active
            Object.values(cables)
                .filter((cable) => {
                    return cable.destination === destinationModule && cable.source === this && cable.type === parameterType;
                })[0]
                .makeActive();

            slider.classList.add("disabled");
        } else {
            slider.classList.remove("disabled");
        }

        // not connecting directly source to parameter but to the analyser and then to destination's parameter slider
        if (slider && (this.audioNode || this.audioNodes)) {
            slider.audioNode = audioContext.createAnalyser();

            // if source is regular node connect using audioNode
            if (this.audioNode) this.audioNode.connect(slider.audioNode);
            // if source is multi-node module connect via audioNodes.output parameter which links to output audioNode
            else if (this.audioNodes) this.audioNodes.output.connect(slider.audioNode);

            this.connectToSlider(destinationModule, slider, parameterType);
        }
    }
    /* function used by audio buffer source's playButton to play the sound */
    playButtonHandler() {
        let selectedBufferName = this.content.options.select.value;

        // switched from on to off so stop the sound
        if (this.isTransmitting === true) {
            this.stopSound();
        } else {
            this.isTransmitting = true;
            this.content.controllers.playButton.classList.add("switch-on");

            // remove old audioNode (if there is any)
            if (this.audioNode) {
                this.audioNode.stop(0);
                this.audioNode.disconnect();
                this.audioNode = undefined;
            }

            //  create a new BufferSource with selected buffer and play it
            this.audioNode = audioContext.createBufferSource();
            this.audioNode.loop = this.content.options.looper.checkbox.checked;
            this.audioNode.buffer = audioContext.nameSoundBuffer[selectedBufferName];

            // send sound to all connected modules/modules' parameters
            this.outcomingCables.forEach((cable) => {
                if (cable.destination.audioNode || cable.destination.audioNodes) {
                    if (cable.type === "input") this.connectToModule(cable.destination);
                    if (cable.type !== "input") this.connectToParameter(cable.destination, cable.type);
                }
            });

            this.audioNode.start(audioContext.currentTime);

            // if there is loop disabled stop the sound after delay
            if (this.audioNode.loop === false) {
                let delay = Math.floor(this.buffer.duration * 1000) + 1;

                this.audioNode.stopTimer = window.setTimeout(() => {
                    this.stopSound();
                }, delay);
            }
        }
    }
    /* function used by playButtonHandler function to stop the sound */
    stopSound() {
        this.isTransmitting = false;
        this.audioNode.stop(0);

        // clear stopTimer parameter (if there is any)
        if (this.audioNode.stopTimer) {
            window.clearTimeout(this.audioNode.stopTimer);
            this.audioNode.stopTimer = undefined;
        }

        this.content.controllers.playButton.classList.remove("switch-on");

        // if loop is enabled sound will play even with switch-off thus kill it with fire
        if (this.audioNode.loop === true) {
            this.audioNode.loop = false;
            this.content.options.looper.checkbox.checked = false;
        }

        this.markAllLinkedCablesAs("deactive");
    }
    /* create analyser on module with given setting */
    visualizeOn(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, style) {
        let animationID = undefined;
        let canvas = this.content.canvas;

        if (canvas) canvas.remove();

        canvas = document.createElement("canvas");
        canvas.id = `${this.id}-content-controllers-canvas`;
        canvas.height = canvasHeight;
        canvas.width = canvasWidth;
        canvas.className = "analyserCanvas";

        this.content.appendChild(canvas);
        this.content.canvas = canvas;

        let ctx = (this.content.drawingContext = canvas.getContext("2d"));

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        if (style === "frequency bars") {
            this.audioNode.fftSize = fftSizeFrequencyBars;
            let bufferLengthAlt = this.audioNode.frequencyBinCount; //it's always half of fftSize
            let dataArrayAlt = new Uint8Array(bufferLengthAlt);

            let drawBar = () => {
                animationID = requestAnimationFrame(drawBar);

                this.audioNode.getByteFrequencyData(dataArrayAlt);
                // data returned in dataArrayAlt array will in range [0-255]

                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);

                let barWidth = (canvasWidth / bufferLengthAlt) * 2.5;
                let x = 0;

                dataArrayAlt.forEach((barHeight) => {
                    ctx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
                    // contex grid is upside down so we substract from y value
                    ctx.fillRect(x, canvasHeight - barHeight / 2, barWidth, barHeight / 2);

                    x += barWidth + 1;
                });
            };
            drawBar();
        }
        if (style === "sine wave") {
            let bufferLength = (this.audioNode.fftSize = fftSizeSineWave);
            let dataArray = new Uint8Array(bufferLength);

            let drawWave = () => {
                animationID = requestAnimationFrame(drawWave);

                this.audioNode.getByteTimeDomainData(dataArray);
                // data returned in dataArray will be in range [0-255]

                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "rgb(0, 0, 0)";
                ctx.beginPath();

                dataArray.forEach((element, index) => {
                    let x = (canvasWidth / bufferLength) * index; // sliceWidth * index
                    let y = (element * canvasHeight) / 256; // 256 comes from dataArray max value;
                    if (!index === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });

                ctx.stroke();
            };
            drawWave();
        }

        return animationID;
    }
}
