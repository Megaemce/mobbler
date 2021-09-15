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
        this.html = undefined; // keeping link to HTML sctructure
        this.id = `module-${++id}`;
        this.isTransmitting = false;
        this.createModule(); // create html's object
        modules[this.id] = this; // add moduleDiv to the dictionary
    }
    get inputActivity() {
        // check all incoming cables if there is anything activly talking to this module. Find return 1 or 0 elements
        let check = Object.values(cables).find((cable) => cable.destination === this && cable.source.isTransmitting);
        if (check) return true;
        return false;
    }
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
    get relatedCables() {
        return Object.values(cables).filter((cable) => cable.destination === this || cable.source === this);
    }
    get incomingCables() {
        return Object.values(cables).filter((cable) => cable.destination === this);
    }
    get outcomingCables() {
        return Object.values(cables).filter((cable) => cable.source === this);
    }
    get modulePosition() {
        this.position = this.html.getBoundingClientRect();
        return this.position;
    }
    // Depth first search all outcoming cables and mark as active or deactive
    markAllLinkedCablesAs(status) {
        let visited = {};
        let currentCable = undefined;
        let stack = this.outcomingCables;

        while (stack.length) {
            currentCable = stack.pop();

            // while we are walking thru let's mark modules and cables correctly
            if (status === "active") {
                currentCable.makeActive();
            }
            if (status === "active" && currentCable.type === "input") {
                currentCable.destination.isTransmitting = true;
            }
            if (status === "deactive") {
                currentCable.makeDeactive();
            }
            // if there is no active module(s) talking to this module set is as not active transmitter
            if (status === "deactive" && currentCable.type === "input" && !currentCable.destination.inputActivity) {
                currentCable.destination.isTransmitting = false;
            }
            if (status === "deactive" && currentCable.type !== "input") {
                currentCable.destination.content.controllers[currentCable.type].slider.classList.remove("disabled");
            }

            // dfs section
            if (!visited[currentCable.id]) {
                visited[currentCable.id] = true;
                // don't try to do dfs on final destination
                if (currentCable.destination.id !== "destination") {
                    currentCable.destination.outcomingCables.forEach((cable) => {
                        if (!visited[cable.id]) {
                            stack.push(cable);
                        }
                    });
                }
            }
        }
    }
    createModule() {
        let module = this;

        buildModule(module);

        // when module is created add some hooks
        // when title is grab move the module
        module.head.titleWrapper.onmousedown = (event) => {
            module.movingModule(event);
        };

        // when close button is clicked delete the module
        module.head.close.onclick = () => {
            module.deleteModule();
        };

        // when looper checkbox is changed play in a loop/stop the sound
        if (module.hasLooper) {
            module.content.options.looper.checkbox.onchange = () => {
                module.playSelectedSound();
            };
        }

        // when normalizer is changed switch audioNode.normalize status
        if (module.hasNormalizer) {
            module.content.options.normalizer.checkbox.onchange = function () {
                module.audioNode.normalize = this.checked;
            };
        }
    }
    createSlider(property, initialValue, min, max, stepUnits, units, scaleLog) {
        let module = this;
        let propertyNoSpaces = property.split(" ").join("");

        buildModuleSlider(module, property, initialValue, min, max, stepUnits, units, scaleLog);

        // when slider is moved (by user or by connected module)
        module.content.controllers[propertyNoSpaces].slider.oninput = function () {
            let sliderValue = scaleLog ? logPositionToValue(this.value, min, max) : this.value;

            // set value on the audiNode parametetr
            if (module.audioNode) module.audioNode[propertyNoSpaces].value = sliderValue;

            // show new value above slider
            module.content.controllers[propertyNoSpaces].info.valueUnit.value.innerHTML = sliderValue;
        };
    }
    addFirstCable() {
        new Cable(this);
    }
    movingModule(event) {
        let canvas = document.getElementById("svgCanvas");
        // Keep module on front
        ++this.html.style.zIndex;

        // remove inital cable with time 0.1s
        this.initalCable.foldCable(0.1);

        // Start physics on all cables
        this.relatedCables.forEach((cable) => {
            cable.startAnimation();
        });

        // Update module's position and its cables
        document.onmousemove = (event) => {
            // show cables on front while moving modules
            canvas.style.zIndex = this.html.style.zIndex + 1;

            // Move drag element by the same amount the cursor has moved.
            this.html.style.left = parseInt(this.html.style.left) + event.movementX + "px";
            this.html.style.top = parseInt(this.html.style.top) + event.movementY + "px";

            // update any lines that point in here.
            this.incomingCables.forEach((cable) => {
                cable.moveEndPoint(event.movementX, event.movementY);
            });

            // update any lines that point out of here.
            this.outcomingCables.forEach((cable) => {
                cable.moveStartPoint(event.movementX, event.movementY);
            });
        };

        // Remove listeners after module release
        document.onmouseup = () => {
            canvas.style.zIndex = 0;

            // cancel physic animation on all cables
            this.relatedCables.forEach((cable) => {
                cable.stopAnimation();
            });

            this.addFirstCable();

            document.onmousemove = undefined;
            document.onmouseup = undefined;
        };
        event.preventDefault();
    }
    deleteModule() {
        // remove inital cable
        this.initalCable && this.initalCable.foldCable();

        // mark all related cables as inactive
        this.markAllLinkedCablesAs("deactive");

        // remove all related cables
        this.relatedCables.forEach((cable) => {
            cable.deleteCable();
        });

        // execute any module-specific function if there is any
        this.onDeletion && this.onDeletion();

        // remove html object
        this.html.parentNode.removeChild(this.html);

        // remove module from modules
        delete modules[this.id];
    }
    connectToModule(destinationModule) {
        // if the sourceModule has an audio node, connect them up.
        // AudioBufferSourceNodes may not have an audio node yet.
        if (this.audioNode && destinationModule.audioNode) {
            this.audioNode.connect(destinationModule.audioNode);
        }

        // if this module is transmitting mark further cables as active
        if (this.isTransmitting) {
            this.markAllLinkedCablesAs("active");
        }

        // execute function if there is any hooked
        if (destinationModule.onConnectInput) {
            destinationModule.onConnectInput();
        }
    }
    connectToSlider(destinationModule, slider, parameterType) {
        // slider.audioNode.fftSize default vaue is 2048
        let dataArray = new Uint8Array(slider.audioNode.fftSize);

        slider.audioNode.getByteTimeDomainData(dataArray);

        // performance tweak - just get the max value of array instead of iterating
        let element = Math.max(...dataArray);
        let scaledValue = scaleBetween(element, 0, 255, slider.minFloat, slider.maxFloat);

        slider.value = slider.scaleLog ? valueToLogPosition(scaledValue, slider.minFloat, slider.maxFloat) : scaledValue;

        if (destinationModule.audioNode) destinationModule.audioNode[parameterType].value = slider.value;

        destinationModule.content.controllers[parameterType].value.innerHTML = scaledValue;

        // update the value inifinite
        destinationModule[parameterType].animationID = requestAnimationFrame(() => {
            this.connectToSlider(destinationModule, slider, parameterType);
        });
    }
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

        // not connecting directly source to parameter but to the destination parameter slider
        if (slider && this.audioNode) {
            slider.audioNode = audioContext.createAnalyser();

            this.audioNode.connect(slider.audioNode);
            destinationModule[parameterType] = {};

            this.connectToSlider(destinationModule, slider, parameterType);
        }
    }
    playSelectedSound() {
        let loop = this.content.options.looper.checkbox.checked;
        let selectedBufferName = this.content.options.select.value;
        let playButton = this.content.controllers.playButton;

        if (this.isTransmitting) {
            this.stopSound(this, playButton);
        } else {
            this.isTransmitting = true;
            playButton.classList.add("switch-on");

            // if there's already a note playing, cut it off
            if (this.audioNode) {
                this.audioNode.stop(0);
                this.audioNode.disconnect();
                this.audioNode = undefined;
            }

            // create a new BufferSource and connect it
            this.audioNode = audioContext.createBufferSource();
            this.audioNode.loop = loop;
            this.audioNode.buffer = audioContext.nameSoundBuffer[selectedBufferName];

            // play sound on all connected output
            this.outcomingCables.forEach((cable) => {
                if (cable.destination && cable.destination.audioNode && cable.type === "input") {
                    this.connectToModule(cable.destination);
                }
                if (cable.destination && cable.destination.audioNode && cable.type !== "input") {
                    this.connectToParameter(cable.destination, cable.type);
                }
            });

            this.audioNode.start(audioContext.currentTime);

            this.markAllLinkedCablesAs("active");

            if (!this.audioNode.loop) {
                let delay = Math.floor(this.buffer.duration * 1000) + 1;

                this.audioNode.stopTimer = window.setTimeout(() => {
                    this.stopSound();
                }, delay);
            }
        }
    }
    stopSound() {
        let playButton = this.content.controllers.playButton;

        this.isTransmitting = false;

        playButton.classList.remove("switch-on");

        if (this.audioNode.stopTimer) {
            window.clearTimeout(this.audioNode.stopTimer);
            this.audioNode.stopTimer = 0;
        }
        // if loop is enabled sound will play even with switch-off thus kill it with fire
        if (this.audioNode.loop) {
            this.audioNode.loop = false;
            this.content.options.looper.checkbox.checked = false;
        }

        this.markAllLinkedCablesAs("deactive");
    }
    // create analyser on given module with given setting
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
