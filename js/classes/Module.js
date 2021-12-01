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
        if (Object.values(cables).find((cable) => cable.destination === this && cable.inputName === "input" && cable.source.isTransmitting)) {
            return true;
        }
        return false;
    }
    /* return input status with one second delay - used to stop analyser with smooth fade */
    get inputActivityWithDelay() {
        setTimeout(this.inputActivity, 1000);
    }
    /* return number of incoming cables to the input (not nessesary active). Used by deleteCable() */
    get inputCount() {
        return Object.values(cables).filter((cable) => cable.destination === this && cable.inputName === "input").length;
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
    /* cancel analyser animation */
    stopAnalyserAnimation() {
        setTimeout(() => {
            window.cancelAnimationFrame(this.animationID["analyser"]);
        }, 200);
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
            // also as there is no other easy way: restart all the slider's animation in all it's outcoming
            // cables connected to other module's parameters
            if (status === "active" && currentCable.inputName === "input") {
                currentCable.destination.isTransmitting = true;
                currentCable.destination.outcomingCables.forEach((cable) => {
                    if (cable.inputName !== "input") {
                        cable.makeActive();
                        currentCable.destination.connectToParameter(cable.destination, cable.inputName);
                    }
                });
            }
            // simply make the cable deactive
            if (status === "deactive") {
                currentCable.makeDeactive();
            }
            // as this cable was module-to-module type and source module is not active anymore,
            // check if there is nothing more actively talking to this module and mark is as inactive
            if (status === "deactive" && currentCable.inputName === "input" && currentCable.destination.inputActivity === false) {
                currentCable.destination.isTransmitting = false;
            }
            // module-to-parameter cable thus just unlock the slider
            if (status === "deactive" && currentCable.inputName !== "input") {
                currentCable.destination.stopSliderAnimation(currentCable.inputName);
                currentCable.destination.content.controllers[currentCable.inputName].slider.classList.remove("disabled");
            }

            // depth first search section
            if (!visited[currentCable.id]) {
                visited[currentCable.id] = true;
                // don't try to do dfs on module-to-parameter cables as destination in those is their mother module thus making
                // further escalation: Source -> Destination's Parameter -> Destination -> Destination's outcominggoing cables
                if (currentCable.inputName === "input") {
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

        // Update module's position and its cables
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
            if (module.name !== "output" && module.name !== "visualisation" && module.name !== "analyser") {
                module.addInitalCable();
            }

            canvas.style.cursor = "default";
            document.onmousemove = undefined;
            document.onmouseup = undefined;
        };
        event.preventDefault();
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
            console.log("connecting to module");
            destinationModule.onConnectInput();
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

        // visualisation nor distortion's drive doesn't have audioNodes attached to sliders
        if (destinationModule.name === "visualisation" || parameterType === "drive") {
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
        const sliderDiv = destinationModule.content.controllers[parameterType].wrapper;
        const sliderValue = slider.scaleLog ? logPositionToValue(slider.value, slider.min, slider.max) : slider.value;
        const sliderCenter = (parseFloat(slider.max) + parseFloat(slider.min)) / 2;

        // is source is active mark cable as active and slider as disabled
        if (module.isTransmitting) {
            slider.classList.add("disabled");
        } else {
            slider.classList.remove("disabled");
        }

        // show alert if slider value is not in a middle
        if (slider.value != sliderCenter) {
            displayAlertOnElement(`Value ${sliderValue} is not in slider center (${sliderCenter}) thus ${module.name}'s output will not cover all of its range`, sliderDiv, 5);
        }

        // change input picture to busy version
        destinationModule.footer[parameterType].img.setAttribute("src", "./img/parameter_input_busy.svg");

        // not connecting directly source to parameter but to the analyser and then to destination's parameter slider
        if (slider && module.audioNode) {
            if (!slider.audioNode) {
                slider.audioNode = new AnalyserNode(audioContext);
                slider.audioNode.fftSize = 32;
            }

            // visualisation nor distortion's drive doesn't have proper audioNode parameters as they are not controlling audioNode
            if (destinationModule.name !== "visualisation" && parameterType !== "drive") {
                destinationModule.audioNode && module.audioNode.connect(destinationModule.audioNode[parameterType]);
            }

            // connect just for slider-animation controlled by analyser
            module.audioNode.connect(slider.audioNode);

            // don't make unnesessary slider's animation if source module is not active
            module.isTransmitting && module.connectToSlider(destinationModule, slider, parameterType, slider.value);
        }
    }
    /* create analyser on module with given setting */
    createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, style) {
        const module = this;
        const canvasDiv = document.createElement("div");
        const canvas = document.createElement("canvas");
        const img = new Image(); // used for pattern

        img.src = "./img/pattern.svg";

        // if there is already other animation kill it
        if (module.animationID["analyser"]) window.cancelAnimationFrame(module.animationID["analyser"]);

        if (module.content.controllers.canvasDiv) {
            module.content.controllers.removeChild(module.content.controllers.canvasDiv);
            module.content.controllers.canvasDiv.canvas.remove();
        }

        canvas.id = `${module.id}-content-controllers-canvas`;
        canvas.height = canvasHeight;
        canvas.width = canvasWidth;
        canvas.className = "canvas";

        module.content.controllers.appendChild(canvasDiv);
        module.content.controllers.canvasDiv = canvasDiv;

        module.content.controllers.canvasDiv.appendChild(canvas);
        module.content.controllers.canvasDiv.canvas = canvas;
        module.content.controllers.canvasDiv.className = "analyser";

        const ctx = (module.content.controllers.canvasDiv.drawingContext = canvas.getContext("2d"));

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        if (style === "frequency bars") {
            /*   ꞈ
             256 ┤╥╥                    
                 │║║  ╥╥          ╥╥╥╥          
                 │║║╥╥║║        ╥╥║║║║          
                 │║║║║║║╥╥    ╥╥║║║║║║╥╥    ╥╥      ╥╥  
                 │║║║║║║║║╥╥╥╥║║║║║║║║║║╥╥╥╥║║╥╥╥╥╥╥║║  
               0 ┼──────────────frequency─────────────┬─›
                 0                                 24000Hz  
            */
            module.audioNode.fftSize = fftSizeFrequencyBars;
            const bufferLength = module.audioNode.frequencyBinCount; //it's always half of fftSize
            const dataArray = new Uint8Array(bufferLength);
            const barWidth = (canvasWidth / bufferLength) * 2.5;

            let drawBar = () => {
                // if there is nothing actively talking don't waste resources
                if (module.inputActivity) {
                    module.animationID["analyser"] = requestAnimationFrame(drawBar);

                    // data returned in dataArray array will in range [0-255]
                    module.audioNode.getByteFrequencyData(dataArray);

                    ctx.fillStyle = ctx.createPattern(img, "repeat");
                    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

                    let x = 0;
                    ctx.beginPath();

                    dataArray.forEach((barHeight, index) => {
                        ctx.fillStyle = `rgb(98, 255, ${barHeight - 100})`;
                        // contex grid is upside down so we substract from y value
                        ctx.fillRect(x, canvasHeight - barHeight / 2, barWidth, barHeight / 2);
                        x += barWidth + 1;
                    });
                    ctx.stroke();
                } else {
                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                }
            };
            drawBar();
        }
        if (style === "spectogram") {
            /*   ꞈ
            ∞ Hz ┤                    
                 │                      
                 │     ̶̛̙͇͉̼̺͔͓͖̤͔̟̟̠̰͕͔͑̽̍̽̓̋̆̂͆́̈́͗̕¸̷̶̛̫̤̲͓̙͇͉̼̺͔͓͖̤͔̟̟̠̰͕͔̈́̌͒̽̍̊̀̈́̿̐̓͌͆͑͑̽̍̽̓̋̆̂͆́̈́͗̕ ̸̨̨̛̹͙̖̩̦̹͈̟̖̼̱̖͙͇̥̰̙̟̤̥̭̖̫̠͔̱̀̋͗̎̽̂͗͗̎̏́̓̋͑̓̔̈́͜͝͝͝  ¸̷̢̡̢̯̜͉͎̦͉̖͈͇̬̘̖͈̹̜͂͝ͅ         ̶̛̙͇͉̼̺͔͓͖̤͔̟̟̠̰͕͔͑̽̍̽̓̋̆̂͆́̈́͗̕¸̷̶̛̫̤̲͓̙͇͉̼̺͔͓͖̤͔̟̟̠̰͕͔̈́̌͒̽̍̊̀̈́̿̐̓͌͆͑͑̽̍̽̓̋̆̂͆́̈́͗̕¸̶͕̠͈͎̖̮̘̂̓͐́͗̌̀̀̇̈̈̊̈́͑̕͜     ̶̛̙͇͉̼̺͔͓͖̤͔̟̟̠̰͕͔͑̽̍̽̓̋̆̂͆́̈́͗̕¸̷̶̛̫̤̲͓̙͇͉̼̺͔͓͖̤͔̟̟̈́̌͒̽̍̊̀̈́̿̐̓͌͆͑͑̽̍̽̓̋̆̂͆́̈́͗̕             
                 │.̵̧͕̟͇̠͓͎̥͊̇͌́̎̿́̒͆͒͂̉̓̒͒̋̃̋͊̾͒͌̓̀͝͝͝.¸̶͕̠͈͎̖̮̘̂̓͐́͗̌̀̀̇̈̈̊̈́͑̕͜¸̸̗̂́̒̇̾́̒͘̕̚͝͠.̵͓̖͓̲̟͋͆́̐̚͝͠͝¸̶̧̡̱̪̟̪͔͖͙̪̈́ͅ.̵̧͕̟͇̠͓͎̥͊̇͌́̎̿́̒͆͒͂̉̓̒͒̋̃̋͊̾͒͌̓̀͝͝͝¸̶͕̠͈͎̖̮̘̂̓͐́͗̌̀̀̇̈̈̊̈́͑̕͜¸̸̗̂́̒̇̾́̒͘̕̚͝͠.̵͓̖͓̲̟͋͆́̐̚͝͠͝¸̶̧̡̱̪̟̪͔͖͙̪̈́ͅ_̵̛̝̂̓́͋̆͊͂̀̍̊̏̓͂̂͒͌̚͝ ¸̶͕̠͈͎̖̮̘̂̓͐́͗̌̀̀̇̈̈̊̈́͑̕͜ ,̸̮͉̤̹̬̜͖̞͚͈̥̈́̇̀̈̂̏́̆̈́͛̾̚͝   .̵̧͕̟͇̠͓͎̥͊̇͌́̎̿́̒͆͒͂̉̓̒͒̋̃̋͊̾͒͌̓̀͝͝͝.¸̶͕̠͈͎̖̮̘̂̓͐́͗̌̀̀̇̈̈̊̈́͑̕͜¸̸̗̂́̒̇̾́̒͘̕̚͝͠         
                 │  
               0 ┼─────────────────time──────────────┬›
                 0                                  ∞ sec  
            */

            module.audioNode.fftSize = fftSizeFrequencyBars;
            const bufferLength = module.audioNode.frequencyBinCount; //it's always half of fftSize
            const dataArray = new Uint8Array(bufferLength);
            const bandHeight = canvasHeight / bufferLength;

            module.content.controllers.canvasDiv.className = "analyser spectro"; // white background

            // taken from: https://github.com/urtzurd/html-audio/blob/gh-pages/static/js/pitch-shifter.js#L253
            let drawBar = () => {
                // if there is nothing actively talking don't waste resources
                if (module.inputActivity) {
                    module.animationID["analyser"] = requestAnimationFrame(drawBar);

                    // data returned in dataArray array will in range [0-255]
                    module.audioNode.getByteFrequencyData(dataArray);

                    const previousImage = ctx.getImageData(1, 0, canvasWidth - 1, canvasHeight);
                    ctx.putImageData(previousImage, 0, 0);

                    for (let i = 0, y = canvasHeight - 1; i < bufferLength; i++, y -= bandHeight) {
                        const color = dataArray[i] << 16;
                        ctx.fillStyle = "#" + color.toString(16);
                        ctx.fillRect(canvasWidth - 1, y, 1, -bandHeight);
                    }
                } else {
                    // maybe it better to leave last spectro on the screen after no signal
                    // ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                }
            };
            drawBar();
        }
        if (style === "sine wave") {
            /*   ꞈ
             256 ┤            .¸            
                 │.¸     ¸.¸·՜   ՝·¸                  
                 │  ՝·¸·՜           `.¸         
                 │                    ՝·     ¸·`՝·¸¸.¸¸   
                 │                      ՝·..·՜         `
               0 ┼────────────────time─────────────────┬›
                 0                                    ∞ sec
            */
            let bufferLength = (module.audioNode.fftSize = fftSizeSineWave);
            let dataArray = new Uint8Array(bufferLength);

            let drawWave = () => {
                // if there is nothing actively talking don't waste resources
                console.log(module.inputActivity);
                if (module.inputActivity) {
                    module.animationID["analyser"] = requestAnimationFrame(drawWave);

                    module.audioNode && module.audioNode.getByteTimeDomainData(dataArray);
                    // data returned in dataArray will be in range [0-255]

                    let pattern = ctx.createPattern(img, "repeat");
                    ctx.fillStyle = pattern;
                    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "rgb(98, 255, 0)";
                    ctx.beginPath();

                    // element range: [0, 255], index range: [0, bufferLength]
                    dataArray.forEach((element, index) => {
                        let x = (canvasWidth / bufferLength) * index; // sliceWidth * index
                        let y = canvasHeight * (element / 256); // 256 comes from dataArray max value;
                        if (!index === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });

                    ctx.stroke();
                } else {
                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                }
            };
            drawWave();
        }
        if (style === "free") {
            /*                                  Mode "create lines from frequencies chart"
                 ꞈ                                                             
             256 ┤                                        ┌                     ┐
                 │՝·¸                                        ՝·¸    ¸·¸      ¸.¸         duplicate k-time
                 │   `.     ¸.·¸        > duplicate and >      `·¸՜    ՝·ֻ՜ ̗`·֬    `   >  rotate (angleRad * k))
                 │      ՝·.·՝     ՝·¸¸·     flip y values       ·՜   ՝·.·՜     ՝·¸·֬        k ∊ [1...symmetries]
                 │                                          ·՜                         
               0 ┼──TimeDomainData──┬›                    └                     ┘            
                 0                 ∞ sec    
                                                Mode "create lines from time domain chart"
                 ꞈ
             256 ┤╥                                       ┌                     ┐
                 │║ ╥     ╥╥                                ՝·¸    ¸·¸      ¸.¸         duplicate k-time
                 │║╥║    ╥║║            > duplicate and >      `·¸՜    ՝·ֻ՜ ̗`·֬    `   >  rotate (angleRad * k))
                 │║║║╥  ╥║║║╥  ╥   ╥      flip y values       ·՜   ՝·.·՜     ՝·¸·֬        k ∊ [1...symmetries]
                 │║║║║╥╥║║║║║╥╥║╥╥╥║                        ·՜                         
               0 ┼───FrequencyData──┬›                    └                     ┘
                 0               24000Hz
             */
            module.content.controllers.canvasDiv.classList.add("visualisation"); // white background

            // fullscreen exiting handlers
            document.addEventListener("fullscreenchange", exitHandler);
            document.addEventListener("webkitfullscreenchange", exitHandler);
            document.addEventListener("mozfullscreenchange", exitHandler);
            document.addEventListener("MSFullscreenChange", exitHandler);

            function exitHandler() {
                if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                }
            }

            module.head.buttonsWrapper.maximize.onclick = () => {
                if (canvas.requestFullScreen) canvas.requestFullScreen();
                else if (canvas.webkitRequestFullScreen) canvas.webkitRequestFullScreen();
                else if (canvas.mozRequestFullScreen) canvas.mozRequestFullScreen();

                canvas.width = window.screen.width;
                canvas.height = window.screen.height;
            };

            const bufferLength = module.audioNode.frequencyBinCount; //it's always half of fftSize
            const dataArrayBars = new Uint8Array(bufferLength);
            const dataArrayWave = new Uint8Array(bufferLength);

            let drawFreely = () => {
                // if there is nothing actively talking don't waste resources
                if (module.inputActivity) {
                    const angle = 360 / module.audioNode.symmetries.value;
                    const angleRad = (angle * Math.PI) / 180;
                    let dataArray;

                    module.animationID["analyser"] = requestAnimationFrame(drawFreely);

                    // data returned in dataArrayBars will be in range [0-255]
                    if (module.audioNode) {
                        if (module.audioNode.type === "create lines from frequencies chart") {
                            module.audioNode.getByteFrequencyData(dataArrayBars);
                            dataArray = dataArrayBars;
                        }
                        if (module.audioNode.type === "create lines from time domain chart") {
                            module.audioNode.getByteTimeDomainData(dataArrayWave);
                            dataArray = dataArrayWave;
                        }
                    }
                    // ctx.fillStyle = "black";
                    // ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                    ctx.strokeStyle = `hsl(${module.audioNode.color.value}, 100%, 50%)`;

                    const lineLength = module.audioNode.lineLength.value;
                    const scale = canvas.height / module.audioNode.scaleDivider.value;

                    ctx.save();

                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.scale(module.audioNode.zoom.value, module.audioNode.zoom.value);
                    ctx.lineWidth = module.audioNode.lineWidth.value;

                    for (let k = 0; k < module.audioNode.symmetries.value; k++) {
                        ctx.rotate(angleRad);

                        ctx.beginPath();

                        // element range: [0, 255], index range: [0, bufferLength]
                        dataArray.forEach((element, index) => {
                            let x = ((canvasWidth * lineLength) / bufferLength) * index; // sliceWidth * index
                            let y = scale * (element / 256); // 256 comes from dataArrayWave max value;
                            if (!index === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        });

                        ctx.stroke();
                        ctx.beginPath();

                        // element range: [0, 255], index range: [0, bufferLength]
                        dataArray.forEach((element, index) => {
                            let x = ((canvasWidth * lineLength) / bufferLength) * index; // sliceWidth * index
                            let y = -scale * (element / 256); // 256 comes from dataArrayWave max value;
                            if (!index === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        });

                        ctx.stroke();
                    }

                    ctx.restore();
                } else {
                    // maybe it is a good idea to not clean visualisation after signal death
                    //ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                }
            };
            drawFreely();
        }
    }
}
