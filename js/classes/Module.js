import Cable from "./Cable.js";
import { audioContext, cables, modules } from "../main.js";
import { valueToLogPosition, scaleBetween, logPositionToValue } from "../helpers/math.js";
import { buildModule, buildModuleSlider, addOpenFileButtonTo } from "../helpers/builders.js";

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
    /* return true/false if there is anything actively talking to this module's input  */
    get inputActivity() {
        if (Object.values(cables).find((cable) => cable.destination === this && cable.inputType === "input" && cable.source.isTransmitting)) {
            return true;
        }
        return false;
    }
    /* return number of incoming cables to the input (not nessesary active). Used by deleteCable() */
    get inputCount() {
        return Object.values(cables).filter((cable) => cable.destination === this && cable.inputType === "input").length;
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

        // put it on front as a first action
        this.bringToFront();

        // set module upfront when choosen
        this.div.onmousedown = () => {
            this.bringToFront();
        };

        // when title is grabbed move the module
        this.head.titleWrapper.onmousedown = (event) => {
            this.movingModule(event);
        };

        let timerID = undefined;
        // reset function for title renaming handlers
        function reset(module) {
            window.clearTimeout(timerID);
            module.head.titleWrapper.children[0].setAttribute("contenteditable", false);
            module.head.titleWrapper.style.cursor = "grab";
            module.head.titleWrapper.onmousedown = (event) => {
                module.movingModule(event);
            };
        }

        // allow title to be renamed
        this.head.titleWrapper.onmouseover = () => {
            timerID = window.setTimeout(() => {
                this.head.titleWrapper.children[0].setAttribute("contenteditable", true);
                // need to click to rename thus disabling onmousedown handler for a moment
                this.head.titleWrapper.style.cursor = "text";
                this.head.titleWrapper.onmousedown = undefined;
            }, 1500);
        };

        // mouseout thus finishing editing
        this.head.titleWrapper.onmouseout = () => {
            reset(this);
        };

        // handle "enter" key save when finishing editing
        document.onkeydown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                reset(this);
                document.onkeyup = undefined;
            }
        };

        // when close button is clicked delete the module
        this.head.close.onclick = () => {
            this.deleteModule();
        };

        // add module to the modules dictionary
        modules[this.id] = this;
    }

    /* build module audio slider html object and attach all logic into it */
    createSlider(property, initialValue, min, max, stepUnits, units, scaleLog, propertyInfo) {
        let propertyNoSpaces = property.split(" ").join("");
        let module = this;

        buildModuleSlider(module, property, initialValue, min, max, stepUnits, units, scaleLog, propertyInfo);

        // set inital values on audioNode
        if (module.audioNode) module.audioNode[propertyNoSpaces].value = initialValue;
        else if (module.audioNodes) module.audioNodes[propertyNoSpaces](initialValue);

        // when slider is moved (by user or by connected module)
        module.content.controllers[propertyNoSpaces].slider.oninput = function () {
            let sliderValue = scaleLog ? logPositionToValue(this.value, this.min, this.max) : this.value;

            // set value on the audiNode parameter
            if (module.audioNode) module.audioNode[propertyNoSpaces].value = sliderValue;
            else if (module.audioNodes) module.audioNodes[propertyNoSpaces](sliderValue);

            // show new value above slider and in debug
            module.content.controllers[propertyNoSpaces].info.valueUnit.value.innerHTML = sliderValue;
            module.content.controllers[propertyNoSpaces].debug.currentValue.innerText = sliderValue;
        };

        // show slider's debug mode when hovered over value for 1 sec
        let debugTimerID = undefined;
        module.content.controllers[propertyNoSpaces].info.valueUnit.value.onmouseover = () => {
            window.setTimeout(() => {
                module.content.controllers[propertyNoSpaces].info.valueUnit.value.style.cursor = "progress";
            }, 300);
            debugTimerID = window.setTimeout(() => {
                module.content.controllers[propertyNoSpaces].debug.classList.add("show");
                module.content.controllers[propertyNoSpaces].info.valueUnit.value.style.cursor = "default";
            }, 1000);
        };

        module.content.controllers[propertyNoSpaces].info.valueUnit.value.onmouseout = () => {
            window.clearTimeout(debugTimerID);
        };

        let renameTimerID = undefined;
        // reset function for parameter renaming handlers
        function reset(module) {
            window.clearTimeout(renameTimerID);
            module.content.controllers[propertyNoSpaces].info.label.span.setAttribute("contenteditable", false);
            module.content.controllers[propertyNoSpaces].info.label.style.cursor = "help";
        }

        // allow parameter to be renamed
        module.content.controllers[propertyNoSpaces].info.label.span.onmouseover = () => {
            renameTimerID = window.setTimeout(() => {
                module.content.controllers[propertyNoSpaces].info.label.span.setAttribute("contenteditable", true);
                module.content.controllers[propertyNoSpaces].info.label.style.cursor = "text";
            }, 1500);
        };

        // mouseout thus finishing editing
        module.content.controllers[propertyNoSpaces].info.label.span.onmouseout = () => {
            reset(this);
        };

        // handle "enter" key save when finishing editing
        document.onkeydown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                reset(this);
                document.onkeyup = undefined;
            }
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
            if (status === "active" && currentCable.inputType === "input") {
                currentCable.destination.isTransmitting = true;
            }
            // it might be that module to parameter got deactivated and slider animation is killed. Restart it
            if (status === "active" && currentCable.inputType !== "input" && currentCable.source.isTransmitting) {
                let slider = currentCable.destination.content.controllers[currentCable.inputType].slider;
                currentCable.source.connectToSlider(currentCable.destination, slider, currentCable.inputType);
            }
            // simply make the cable deactive
            if (status === "deactive") {
                currentCable.makeDeactive();
            }
            // as this cable was module-to-module type and source module is not active anymore,
            // check if there is nothing more actively talking to this module and mark is as inactive
            if (status === "deactive" && currentCable.inputType === "input" && currentCable.destination.inputActivity === false) {
                currentCable.destination.isTransmitting = false;
            }
            // module-to-parameter cable thus just unlock the slider
            if (status === "deactive" && currentCable.inputType !== "input") {
                currentCable.destination.stopSliderAnimation(currentCable.inputType);
                currentCable.destination.content.controllers[currentCable.inputType].slider.classList.remove("disabled");
            }

            // depth first search section
            if (!visited[currentCable.id]) {
                visited[currentCable.id] = true;
                // don't try to do dfs on output nor module-to-parameter cable
                if (currentCable.destination.name !== "output" && currentCable.inputType === "input") {
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

        // update cursor
        canvas.style.cursor = "grabbing";

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
                cable.moveEndPointBy(event.movementX, event.movementY);
                this.isTransmitting && cable.makeActive();
            });

            // update any lines that point out of here
            this.outcomingCables.forEach((cable) => {
                cable.moveStartPointBy(event.movementX, event.movementY);
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
            if (this.name !== "output" && this.name !== "visualisation") {
                this.addInitalCable();
            }

            canvas.style.cursor = "default";
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
        this.onDeletion && this.onDeletion();

        // remove html object
        this.div.parentNode.removeChild(this.div);

        // remove module from modules
        delete modules[this.id];

        // disconnect audioNode (if there is any active)
        this.audioNode && this.audioNode.disconnect();

        // remove object
        delete this;
    }
    /* connect this module to destinationModule and send information further */
    connectToModule(destinationModule) {
        let source = undefined;
        let destination = undefined;

        // if source module is multi-node effect act differently
        if (this.audioNodes) source = this.audioNodes.outputNode;
        else if (this.audioNode) source = this.audioNode;

        // if destination module is multi-node effect act differently
        if (destinationModule.audioNodes) destination = destinationModule.audioNodes.inputNode;
        else if (destinationModule.audioNode) destination = destinationModule.audioNode;

        // if this module is transmitting make connection and mark further cables as active
        source && destination && source.connect(destination);

        if (this.isTransmitting) {
            this.markAllLinkedCablesAs("active");
        }

        // change input picture to busy version
        destinationModule.div.input.setAttribute("src", "./img/input_busy.svg");

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
        let scaledValue = scaleBetween(element, 0, 255, parseFloat(slider.min), parseFloat(slider.max), slider.step.toString().split(".")[1]);
        slider.value = slider.scaleLog ? valueToLogPosition(scaledValue, parseFloat(slider.min), parseFloat(slider.max)) : scaledValue;

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
                .find((cable) => {
                    return cable.destination === destinationModule && cable.source === this && cable.inputType === parameterType;
                })
                .makeActive();
            slider.classList.add("disabled");
        } else {
            slider.classList.remove("disabled");
        }

        // change input picture to busy version
        destinationModule.footer[parameterType].img.setAttribute("src", "./img/parameter_input_busy.svg");

        // not connecting directly source to parameter but to the analyser and then to destination's parameter slider
        if (slider && (this.audioNode || this.audioNodes)) {
            if (!slider.audioNode) {
                slider.audioNode = audioContext.createAnalyser();
                slider.audioNode.fftSize = 32;
            }

            // if source is regular node connect using audioNode
            if (this.audioNode) this.audioNode.connect(slider.audioNode);
            // if source is multi-node module connect via audioNodes.outputNode audioNode
            else if (this.audioNodes) this.audioNodes.outputNode.connect(slider.audioNode);

            // don't make unnesessary slider's animation if source module is not active
            this.isTransmitting && this.connectToSlider(destinationModule, slider, parameterType);
        }
    }
    /* create analyser on module with given setting */
    createAnalyser(canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, style) {
        let canvasDiv = document.createElement("div");
        let canvas = document.createElement("canvas");
        let animationID = undefined;

        if (this.content.controllers.canvasDiv) {
            this.content.controllers.removeChild(this.content.controllers.canvasDiv);
            this.content.controllers.canvasDiv.canvas.remove();
        }

        canvas.id = `${this.id}-content-controllers-canvas`;
        canvas.height = canvasHeight;
        canvas.width = canvasWidth;
        canvas.className = "canvas";

        this.content.controllers.appendChild(canvasDiv);
        this.content.controllers.canvasDiv = canvasDiv;

        this.content.controllers.canvasDiv.appendChild(canvas);
        this.content.controllers.canvasDiv.canvas = canvas;
        this.content.controllers.canvasDiv.className = "analyser";

        let ctx = (this.content.controllers.canvasDiv.drawingContext = canvas.getContext("2d"));

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        if (style === "frequency bars") {
            this.audioNode.fftSize = fftSizeFrequencyBars;
            let bufferLength = this.audioNode.frequencyBinCount; //it's always half of fftSize
            let dataArray = new Uint8Array(bufferLength);
            let img = new Image();
            img.src = "./img/pattern.svg";

            let drawBar = () => {
                animationID = requestAnimationFrame(drawBar);

                this.audioNode.getByteFrequencyData(dataArray);

                // data returned in dataArray array will in range [0-255]

                let pattern = ctx.createPattern(img, "repeat");
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);

                let barWidth = (canvasWidth / bufferLength) * 2.5;
                let x = 0;

                dataArray.forEach((barHeight) => {
                    ctx.fillStyle = `rgb(98, 255, ${barHeight - 100})`;
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
            let img = new Image();
            img.src = "./img/pattern.svg";

            let drawWave = () => {
                animationID = requestAnimationFrame(drawWave);

                this.audioNode && this.audioNode.getByteTimeDomainData(dataArray);
                // data returned in dataArray will be in range [0-255]

                let pattern = ctx.createPattern(img, "repeat");
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "rgb(98, 255, 0)";
                ctx.beginPath();

                let x = 0;

                // element range: [0, 255], index range: [0, bufferLength]
                dataArray.forEach((element, index) => {
                    let x = (canvasWidth / bufferLength) * index; // sliceWidth * index
                    let y = canvasHeight * (element / 256); // 256 comes from dataArray max value;
                    if (!index === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });

                ctx.stroke();
            };
            drawWave();
        }
        if (style === "free") {
            let amount = 8;

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

            this.head.buttonsWrapper.maximize.onclick = () => {
                if (canvas.requestFullScreen) canvas.requestFullScreen();
                else if (canvas.webkitRequestFullScreen) canvas.webkitRequestFullScreen();
                else if (canvas.mozRequestFullScreen) canvas.mozRequestFullScreen();

                canvas.width = window.screen.width;
                canvas.height = window.screen.height;
            };

            // source: http://paperjs.org/examples/satie-liked-to-draw/
            function getEqualizerBands(data) {
                var bands = [];
                var amount = Math.sqrt(data.length) / 2;
                for (var i = 0; i < amount; i++) {
                    var start = Math.pow(2, i) - 1;
                    var end = start * 2 + 1;
                    var sum = 0;
                    for (var j = start; j < end; j++) {
                        sum += data[j];
                    }
                    var avg = sum / (255 * (end - start));
                    bands[i] = Math.sqrt(avg / Math.sqrt(2));
                }
                return bands;
            }

            this.audioNode.fftSize = Math.pow(2, amount) * 2;
            let bufferLength = this.audioNode.frequencyBinCount; //it's always half of fftSize, thus 2**(amount-1)
            let dataArray = new Uint8Array(bufferLength);
            let zoom = 1;

            let drawFreely = () => {
                let angle = 360 / this.audioNode.symmetries.value;
                let angleRad = (angle * Math.PI) / 180;

                animationID = requestAnimationFrame(drawFreely);

                // data returned in dataArray will be in range [0-255]
                this.audioNode && this.audioNode.getByteFrequencyData(dataArray);
                let bands = getEqualizerBands(dataArray, true);

                //ctx.fillStyle = "white";
                //tx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.lineWidth = 2;
                ctx.strokeStyle = `hsl(${this.audioNode.color.value}, 100%, 50%)`;

                let barWidth = this.audioNode.barWidth.value;
                let scale = canvas.height / this.audioNode.scaleDivider.value;

                ctx.save();

                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.scale(this.audioNode.zoom.value, this.audioNode.zoom.value);
                ctx.lineWidth = this.audioNode.lineWidth.value;

                for (let k = 0; k < this.audioNode.symmetries.value; k++) {
                    ctx.rotate(angleRad);
                    ctx.beginPath();
                    for (var i = 1; i <= amount; i++) {
                        let x1 = barWidth * i;
                        let y1 = -bands[i - 1] * scale;

                        let x2 = barWidth * (i + 1);
                        let y2 = -bands[i] * scale;

                        // source: https://stackoverflow.com/a/40978275
                        var x_mid = (x1 + x2) / 2;
                        var y_mid = (y1 + y2) / 2;
                        var cp_x1 = (x_mid + x1) / 2;
                        var cp_x2 = (x_mid + x2) / 2;

                        if (i === 0) ctx.moveTo(x1, y1);
                        else {
                            ctx.quadraticCurveTo(cp_x1, y1, x_mid, y_mid);
                            ctx.quadraticCurveTo(cp_x2, y2, x2, y2);
                        }
                    }
                    ctx.stroke();
                    ctx.beginPath();
                    for (var i = 1; i <= amount; i++) {
                        let x1 = barWidth * i;
                        let y1 = bands[i - 1] * scale;

                        let x2 = barWidth * (i + 1);
                        let y2 = bands[i] * scale;

                        // source: https://stackoverflow.com/a/40978275
                        var x_mid = (x1 + x2) / 2;
                        var y_mid = (y1 + y2) / 2;
                        var cp_x1 = (x_mid + x1) / 2;
                        var cp_x2 = (x_mid + x2) / 2;

                        if (i === 0) ctx.moveTo(x1, y1);
                        else {
                            ctx.quadraticCurveTo(cp_x1, y1, x_mid, y_mid);
                            ctx.quadraticCurveTo(cp_x2, y2, x2, y2);
                        }
                    }
                    ctx.stroke();
                }

                ctx.restore();
            };
            drawFreely();
        }

        return animationID;
    }
}
