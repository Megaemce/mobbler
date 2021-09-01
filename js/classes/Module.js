import Cable from "./Cable.js";
import { audioContext } from "../main.js";
import { valueToLogPosition, scaleBetween, logPositionToValue } from "../helpers/math.js";

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
        this.incomingCables = new Array();
        this.outcomingCables = new Array();
        this.html = undefined; // keeping link to HTML sctructure
        this.id = `module-${++id}`;
        this.createModuleObject();
    }
    createModuleObject() {
        let modules = document.getElementById("modules");
        let mainWidth = modules.offsetWidth;
        let module = document.createElement("div");
        let head = document.createElement("div");
        let title = document.createElement("span");
        let close = document.createElement("a");
        let diode = document.createElement("div");
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

        // head-diode
        diode.className = "diode";

        // head-title
        title.className = "title";
        title.appendChild(document.createTextNode(this.name));
        title.name = this.name;

        // head-close
        close.className = "close";
        close.href = "#";
        close.onclick = () => {
            this.disconnectModule();
            module.parentNode.removeChild(module);
        };

        // head
        head.className = "head";
        head.onmousedown = (event) => {
            this.movingModule(event);
        };
        head.appendChild(diode);
        head.appendChild(title);
        head.appendChild(close);

        head.diode = diode;
        head.close = close;

        // content-options
        options.className = "options";

        if (this.hasLooper || this.hasNormalizer || this.arrayForSelect) {
            if (this.arrayForSelect) {
                let select = document.createElement("select");

                select.className = "ab-source";
                select.id = `${this.id}-content-options-select`;

                this.arrayForSelect.forEach((object) => {
                    let option = document.createElement("option");
                    option.appendChild(document.createTextNode(object));
                    select.appendChild(option);

                    select.option = option;
                });

                options.appendChild(select);

                options.select = select;
            }
            if (this.hasLooper || this.hasNormalizer) {
                let checkbox = document.createElement("input");
                let label = document.createElement("label");
                let looper = document.createElement("div");
                let normalizer = document.createElement("div");

                checkbox.type = "checkbox";
                checkbox.id = `${this.id}-content-options-checkbox`;

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
                    normalizer.lable = label;

                    module.classList.add("has-normalizer");
                    options.appendChild(normalizer);

                    options.normalizer = normalizer;
                }
            }
            content.appendChild(options);

            content.options = options;
        }

        // content-controllers
        controllers.className = "controllers";

        // content
        content.className = "content";

        content.appendChild(controllers);

        content.controllers = controllers;

        if (this.hasInput) {
            // input
            let input = document.createElement("div");
            input.className = "input";
            input.parentModule = this; // keep info about parent for stopMovingCable
            input.type = "input"; // keep info about type for stopMovingCable
            this.input = input;
            module.appendChild(input);
        }

        // footer
        footer.className = "footer";

        module.setAttribute("audioNodeType", this.name);
        module.appendChild(head);
        module.appendChild(content);
        module.appendChild(footer);

        this.head = head;
        this.content = content;
        this.footer = footer;

        // add the node into the soundfield
        modules.appendChild(module);
        modules[id] = module;
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

        // content-cotrollers-$propertyNoSpaces-info-property
        label.className = "label";
        label.appendChild(document.createTextNode(property));

        // content-cotrollers-$propertyNoSpaces-info-value
        value.className = "value";
        // there is a bug with range between 0-0.9: (0,0.5) = 0, [0.5,1) = 1
        // thus showing buggy value before user interaction
        if (initialValue >= 0 && initialValue < 0.5) initialValue = 0;
        if (initialValue >= 0.5 && initialValue < 1) initialValue = 1;

        value.appendChild(document.createTextNode(initialValue));

        // content-cotrollers-$propertyNoSpaces-info-units
        unit.className = "value";
        unit.appendChild(document.createTextNode(units));

        valueUnit.className = "value-unit";
        valueUnit.appendChild(value);
        valueUnit.appendChild(unit);

        valueUnit.value = value;
        valueUnit.unit = unit;

        // content-cotrollers-$propertyNoSpaces-info
        info.className = "slider-info";
        info.appendChild(label);
        info.appendChild(valueUnit);

        info.label = label;

        // content-cotrollers-$propertyNoSpaces-slider
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

        // content-cotrollers-$propertyNoSpaces
        sliderDiv.className = "slider";
        sliderDiv.appendChild(info);
        sliderDiv.appendChild(sliderWraper);

        sliderDiv.info = info;
        sliderDiv.slider = slider;

        this.content.controllers.appendChild(sliderDiv);

        this.content.controllers[property] = sliderDiv;
        this.content.controllers[property].value = value;
        this.content.controllers[property].unit = unit;

        // footer-parameter-$propertyNoSpaces
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
        let startingX = event.clientX + window.scrollX; // Get cursor position with respect to the page.
        let startingY = event.clientY + window.scrollY;
        let moduleLeft = parseInt(this.html.style.left);
        let moduleTop = parseInt(this.html.style.top);

        // Keep module on front
        ++this.html.style.zIndex;

        // Start physics on all cables
        this.incomingCables.forEach((cable) => {
            cable.startAnimation();
        });
        this.outcomingCables.forEach((cable) => {
            cable.startAnimation();
        });

        // Update module's position and its cables
        document.onmousemove = (event) => {
            let x = event.clientX + window.scrollX;
            let y = event.clientY + window.scrollY;

            // Move drag element by the same amount the cursor has moved.
            this.html.style.left = moduleLeft + x - startingX + 2 + "px";
            this.html.style.top = moduleTop + y - startingY + 5 + "px";

            // update any lines that point in here.
            if (this.incomingCables) {
                x = window.scrollX + this.html.offsetLeft + 12;
                y = window.scrollY + this.html.offsetTop + 20;

                this.incomingCables.forEach((cable) => {
                    cable.updateEndPoint(x, y);
                });
            }

            // update any lines that point out of here.
            if (this.outcomingCables) {
                x = window.scrollX + this.html.offsetLeft + this.html.offsetWidth;
                y = window.scrollY + this.html.offsetTop + 12;

                this.outcomingCables.forEach((cable) => {
                    cable.updateStartPoint(x, y);
                });
            }
        };

        // Remove listeners after module release
        document.onmouseup = () => {
            // cancel physic animation on all cables
            this.incomingCables.forEach((cable) => {
                cable.stopAnimation();
            });
            this.outcomingCables.forEach((cable) => {
                cable.stopAnimation();
            });
            document.onmousemove = undefined;
            document.onmouseup = undefined;
        };
        event.preventDefault();
    }
    disconnectModule() {
        // go to the neighboors and check if there are pointing back to the same direction as cable
        if (this.outcomingCables) {
            // slice(0): little trick to delete element from array while iterating thru
            this.outcomingCables.slice(0).forEach((cable) => {
                cable.deleteCable();
            });
            this.outcomingCables = undefined;
        }

        if (this.incomingCables) {
            this.incomingCables.slice(0).forEach((cable) => {
                cable.deleteCable();
            });
            this.incomingCables = undefined;
        }
        if (this.onDisconnect) this.onDisconnect();
    }
    connectToModule(destinationModule) {
        // if the sourceModule has an audio node, connect them up.
        // AudioBufferSourceNodes may not have an audio node yet.
        if (this.audioNode && destinationModule.audioNode) this.audioNode.connect(destinationModule.audioNode);

        // execute function if there is any hooked
        if (this.onConnectInput) this.onConnectInput();

        // check if not final destination (no head) and turn diode on
        if (destinationModule.head && destinationModule.head.diode) destinationModule.head.diode.classList.add("diode-on");
    }
    connectToParameter(destinationModule, parameterType) {
        let slider = destinationModule.content.controllers[parameterType].slider;

        if (slider && this.audioNode) {
            slider.classList.add("disabled");
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

        if (playButton.isPlaying) this.stopSound(this, playButton);
        else {
            playButton.isPlaying = true;
            this.head.diode.className = "diode diode-on";
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
            if (this.outcomingCables) {
                this.outcomingCables.forEach((cable) => {
                    // it might be that someone click on the loop button when the module is not connected
                    // thus checking audioNode from loose (not connected) cable
                    cable.destination && this.audioNode.connect(cable.destination.audioNode);
                });
            }
            this.audioNode.start(audioContext.currentTime);

            if (!this.audioNode.loop) {
                let delay = Math.floor(this.buffer.duration * 1000) + 1;
                // bind: set the value of a function's 'this' regardless of how it's called
                // without bind stopSound will be called on this === window
                this.audioNode.stopTimer = window.setTimeout(this.stopSound.bind(this), delay);
            }
        }
    }
    stopSound() {
        let playButton = this.content.controllers.playButton;

        playButton.isPlaying = false;
        playButton.classList.remove("switch-on");
        this.head.diode.className = "diode";

        if (this.audioNode.stopTimer) {
            window.clearTimeout(this.audioNode.stopTimer);
            this.audioNode.stopTimer = 0;
        }
        // if loop is enabled sound will play even with switch-off thus kill it with fire
        if (this.audioNode.loop) {
            this.audioNode.loop = false;
            this.content.options.looper.checkbox.checked = false;
        }
    }
    // create analyser on given module with given setting
    visualizeOn(drawVisual, canvasHeight, canvasWidth, fftSizeSineWave, fftSizeFrequencyBars, style) {
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
                drawVisual = requestAnimationFrame(drawBar);

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
                drawVisual = requestAnimationFrame(drawWave);

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
    }
}
