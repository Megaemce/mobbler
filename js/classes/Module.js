import Cable from "./Cable.js";
import { audioContext, cables, modules } from "../main.js";
import { valueToLogPosition, scaleBetween, logPositionToValue } from "../helpers/math.js";

/* ======TO DO========
   
[BUG] kiedy cabel do slidera jest wylaczony slider ciagle nie jest dostepny do uzycia
najprawdopodobniej trzeba anulowac funkcje connectToSlider

   ===================*/

let tempx = 50,
    tempy = 100,
    id = 0;

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
        this.createModuleObject();
    }
    get inputActivity() {
        // check all incoming cables if there is anything activly talking to this module
        let isActive = false;
        Object.values(cables).forEach((cable) => {
            if (cable.destination === this && cable.source.isTransmitting) {
                isActive = true;
            }
        });

        return isActive; // input is receiving active impulse(s)
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
                if (currentCable.destination.id !== "destination") {
                    // no final destination
                    currentCable.destination.outcomingCables.forEach((cable) => {
                        if (!visited[cable.id]) {
                            stack.push(cable);
                        }
                    });
                }
            }
        }
    }
    createModuleObject() {
        let modulesDiv = document.getElementById("modules");
        let mainWidth = modulesDiv.offsetWidth;
        let module = document.createElement("div");
        let head = document.createElement("div");
        let titleWrapper = document.createElement("div");
        let title = document.createElement("span");
        let close = document.createElement("a");
        let content = document.createElement("div");
        let options = document.createElement("div");
        let controllers = document.createElement("div");
        let footer = document.createElement("footer");

        this.html = module;
        this.html.id = this.id; // just for logging
        this.html.self = this; // just for logging

        module.className = "module";

        module.style.left = `${tempx}px`;
        module.style.top = `${tempy}px`;

        if (tempx > mainWidth - 450) {
            tempy += 300;
            tempx = 50 + id;
        } else tempx += 300;
        if (tempy > window.innerHeight - 300) tempy = 100 + id;

        // module.head.title
        title.className = "title";
        title.appendChild(document.createTextNode(this.name));
        title.name = this.name;

        // module.head.title.wrapper
        titleWrapper.className = "title-wrapper";
        titleWrapper.appendChild(title);
        titleWrapper.onmousedown = (event) => {
            this.movingModule(event);
        };

        // module.head.close
        close.className = "close";
        close.href = "#";
        close.onclick = () => {
            this.deleteModule();
        };

        // moudule.head
        head.className = "head";
        head.appendChild(titleWrapper);
        head.appendChild(close);

        head.close = close;

        // module.content.options
        options.className = "options";

        if (this.hasLooper || this.hasNormalizer || this.arrayForSelect) {
            if (this.arrayForSelect) {
                let select = document.createElement("select");

                // module.content.options.select
                select.className = "ab-source";

                this.arrayForSelect.forEach((object) => {
                    let option = document.createElement("option");
                    option.appendChild(document.createTextNode(object));
                    select.add(option);
                });

                options.appendChild(select);
                options.select = select;
            }
            if (this.hasLooper || this.hasNormalizer) {
                let checkbox = document.createElement("input");
                let label = document.createElement("label");
                let looper = document.createElement("div");
                let normalizer = document.createElement("div");

                // module.content.options.checkbox
                checkbox.type = "checkbox";

                if (this.hasLooper) {
                    checkbox.onchange = function () {
                        module.loop = this.checked;
                    };

                    // To associate label with an input element, you need to give the input an id attribute.
                    label.htmlFor = `${this.id}-content-options-looper`;
                    label.appendChild(document.createTextNode("Loop"));

                    looper.className = "looper";
                    looper.id = `${this.id}-content-options-looper`;
                    looper.appendChild(checkbox);
                    looper.appendChild(label);

                    looper.checkbox = checkbox;
                    looper.label = label;

                    module.classList.add("has-looper");
                    options.appendChild(looper);

                    options.looper = looper;
                }

                if (this.hasNormalizer) {
                    checkbox.onchange = () => {
                        this.audioNode.normalize = this.checked;
                    };

                    label.htmlFor = `${this.id}-content-options-looper`;
                    label.appendChild(document.createTextNode("Norm"));

                    normalizer.className = "normalizer";
                    normalizer.id = `${this.id}-content-options-normalizer`;
                    normalizer.appendChild(checkbox);
                    normalizer.appendChild(label);

                    normalizer.checkbox = checkbox;
                    normalizer.label = label;

                    module.classList.add("has-normalizer");
                    options.appendChild(normalizer);

                    options.normalizer = normalizer;
                }
            }
            content.appendChild(options);

            content.options = options;
        }

        // module.content.controllers
        controllers.className = "controllers";

        // module.content
        content.className = "content";
        content.appendChild(controllers);
        content.controllers = controllers;

        if (this.hasInput) {
            // module.input
            let input = document.createElement("div");
            input.className = "input";
            input.parentModule = this; // keep info about parent for movingCable
            input.type = "input"; // keep info about type for movingCable
            module.appendChild(input);
            module.input = input;
        }

        // module.footer
        footer.className = "footer";

        module.setAttribute("audioNodeType", this.name);
        module.appendChild(head);
        module.appendChild(content);
        module.appendChild(footer);

        this.head = head;
        this.content = content;
        this.footer = footer;

        // add the node into the soundfield
        modulesDiv.appendChild(module);

        // add module to the dictionary
        modules[this.id] = this;
    }
    createModuleSlider(property, initialValue, min, max, stepUnits, units, scaleLog) {
        let propertyNoSpaces = property.split(" ").join("");
        let sliderDiv = document.createElement("div");
        let info = document.createElement("div");
        let label = document.createElement("span");
        let value = document.createElement("span");
        let unit = document.createElement("span");
        let valueUnit = document.createElement("div");
        let slider = document.createElement("input");
        let sliderWraper = document.createElement("div");
        let audioParam = document.createElement("div");

        // module.content.cotrollers.$propertyNoSpaces.info.property
        label.className = "label";
        label.appendChild(document.createTextNode(property));

        // module.content.cotrollers.$propertyNoSpaces.info.value
        value.className = "value";
        // there is a bug with range between 0-0.9: (0,0.5) = 0, [0.5,1) = 1
        // thus showing buggy value before user interaction
        if (initialValue >= 0 && initialValue < 0.5) initialValue = 0;
        if (initialValue >= 0.5 && initialValue < 1) initialValue = 1;

        value.appendChild(document.createTextNode(initialValue));

        // module.content.cotrollers.$propertyNoSpaces.info.units
        unit.className = "value";
        unit.appendChild(document.createTextNode(units));

        valueUnit.className = "value-unit";
        valueUnit.appendChild(value);
        valueUnit.appendChild(unit);
        valueUnit.value = value;
        valueUnit.unit = unit;

        // module.content.cotrollers.$propertyNoSpaces.info
        info.className = "slider-info";
        info.appendChild(label);
        info.appendChild(valueUnit);
        info.label = label;

        // module.content.controllers.$propertyNoSpaces.slider
        slider.type = "range";
        slider.scaleLog = scaleLog;
        slider.min = min;
        slider.max = max;
        slider.minFloat = parseFloat(min);
        slider.maxFloat = parseFloat(max);
        // set inital value to the correct position before user starts to play
        slider.value = scaleLog ? valueToLogPosition(initialValue, min, max) : initialValue;
        slider.step = stepUnits;
        let that = this;
        slider.oninput = function () {
            let sliderValue = scaleLog ? logPositionToValue(this.value, min, max) : this.value;

            if (that.audioNode) that.audioNode[propertyNoSpaces].value = sliderValue;

            // in case user is just playing around without audio on
            value.innerHTML = sliderValue;
        };

        sliderWraper.className = "input-wrapper";
        sliderWraper.appendChild(slider);

        // module.content.cotrollers.$propertyNoSpaces
        sliderDiv.className = "slider";
        sliderDiv.appendChild(info);
        sliderDiv.appendChild(sliderWraper);
        sliderDiv.info = info;
        sliderDiv.slider = slider;

        this.content.controllers.appendChild(sliderDiv);
        this.content.controllers[propertyNoSpaces] = sliderDiv;
        this.content.controllers[propertyNoSpaces].value = value;
        this.content.controllers[propertyNoSpaces].unit = unit;

        // module.footer.$propertyNoSpaces
        audioParam.type = propertyNoSpaces; //keep it for stopMovingCable
        audioParam.parentModule = this; // keep info about parent for stopMovingCable
        audioParam.className = "audio-parameter";

        this.footer.appendChild(audioParam);

        this.footer[propertyNoSpaces] = audioParam;
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

        if (slider && this.audioNode) {
            slider.audioNode = audioContext.createAnalyser();

            this.audioNode.connect(slider.audioNode);

            // slider.audioNode.fftSize default vaue is 2048
            let dataArray = new Uint8Array(slider.audioNode.fftSize);

            function connectToSlider() {
                slider.audioNode.getByteTimeDomainData(dataArray);

                // performance tweak - just get the max value of array instead of iterating
                let element = Math.max(...dataArray);
                let scaledValue = scaleBetween(element, 0, 255, slider.minFloat, slider.maxFloat);

                slider.value = slider.scaleLog ? valueToLogPosition(scaledValue, slider.minFloat, slider.maxFloat) : scaledValue;

                if (destinationModule.audioNode) destinationModule.audioNode[parameterType].value = slider.value;

                destinationModule.content.controllers[parameterType].value.innerHTML = scaledValue;

                //setTimeout(() => {
                requestAnimationFrame(connectToSlider);
                //}, 1000 / 60);
            }
            connectToSlider();
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
