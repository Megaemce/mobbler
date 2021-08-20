import audioContext from "../main.js";
import Cable from "./Cable.js";
import { valueToLogPosition, scaleBetween, logPositionToValue } from "../helpers/math.js";

let tempx = 50,
    tempy = 100,
    id = 0;

let whileMovingModuleHandler;

// Node moving functions - these are used for dragging the audio modules,
// function is set on head div inside the module
function stopMovingModule() {
    // Stop capturing mousemove and m ouseup events.
    document.removeEventListener("mousemove", whileMovingModuleHandler, true);
    document.removeEventListener("mouseup", stopMovingModule, true);
}

export default class Module {
    constructor(name, hasOutput, hasLooper, hasNormalizer, arrayForSelect) {
        this.name = name;
        this.hasOutput = hasOutput;
        this.hasLooper = hasLooper;
        this.hasNormalizer = hasNormalizer;
        this.arrayForSelect = arrayForSelect;
        this.createModuleObject();
    }
    createModuleObject() {
        let modules = document.getElementById("modules");
        let mainWidth = modules.offsetWidth;
        let module = document.createElement("div");
        this.module = module;
        let head = document.createElement("div");
        let title = document.createElement("span");
        let close = document.createElement("a");
        let diode = document.createElement("div");
        let content = document.createElement("div");
        let options = document.createElement("div");
        let controllers = document.createElement("div");
        let nodes = document.createElement("div");
        let output = document.createElement("div");
        let footer = undefined; // keep undefined just to test if it was created
        ++id;

        module.className = "module";
        module.id = `module-${id}`;
        module.style.left = `${tempx}px`;
        module.style.top = `${tempy}px`;

        if (tempx > mainWidth - 450) {
            tempy += 300;
            tempx = 50 + id;
        } else tempx += 300;
        if (tempy > window.innerHeight - 300) tempy = 100 + id;

        diode.className = "diode";
        diode.id = `module-${id}-head-diode`;

        title.className = "title";
        title.id = `module-${id}-head-title`;
        title.appendChild(document.createTextNode(this.name));
        title.name = this.name;

        close.className = "close";
        close.id = `module-${id}-head-close`;
        close.href = "#";
        close.onclick = () => {
            this.disconnectModule();
            module.parentNode.removeChild(module);
        };

        head.className = "head";
        head.id = `module-${id}-head`;
        head.onmousedown = (event) => {
            this.movingModule(event);
        };
        head.appendChild(diode);
        head.appendChild(title);
        head.appendChild(close);

        head.diode = diode;
        head.close = close;

        options.className = "options";
        options.id = `module-${id}-content-options`;

        if (this.hasLooper || this.hasNormalizer || this.arrayForSelect) {
            if (this.arrayForSelect) {
                let select = document.createElement("select");

                select.className = "ab-source";
                select.id = `module-${id}-content-options-select`;

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
                checkbox.id = `module-${id}-content-options-checkbox`;

                if (this.hasLooper) {
                    checkbox.onchange = function () {
                        module.loop = this.checked;
                    };

                    // To associate label with an input element, you need to give the input an id attribute.
                    label.htmlFor = `module-${id}-content-options-looper`;
                    label.appendChild(document.createTextNode("Loop"));

                    looper.className = "looper";
                    looper.id = `module-${id}-content-options-looper`;
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

                    label.htmlFor = `module-${id}-content-options-looper`;
                    label.appendChild(document.createTextNode("Norm"));

                    normalizer.className = "normalizer";
                    normalizer.id = `module-${id}-content-options-normalizer`;
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

        controllers.className = "controllers";
        controllers.id = `module-${id}-content-controllers`;

        content.className = "content";
        content.id = `module-${id}-content`;

        content.appendChild(controllers);

        content.controllers = controllers;

        nodes.className = "nodes";
        nodes.id = `module-${id}-nodes`;

        if (this.hasInput) {
            let input = document.createElement("div");
            input.className = "node module-input";
            input.id = `module-${id}-nodes-input`;
            input.parentModule = module; // keep info about parent for stopMovingCable
            input.type = "input"; // keep info about type for stopMovingCable
            nodes.appendChild(input);

            nodes.input = input;
        }

        //output.className = "node module-output";
        //output.id = `module-${id}-nodes-output`;

        // output.onmousedown = function (event) {
        //     output.classList.add("hidden");
        //     createCable(event, module);
        // }
        //nodes.appendChild(output);

        //nodes.output = output;

        footer = document.createElement("footer");
        footer.className = "footer";
        footer.id = `module-${id}-footer`;

        module.setAttribute("audioNodeType", this.name);
        module.appendChild(head);
        module.appendChild(content);
        module.appendChild(nodes);
        module.appendChild(footer);

        this.head = head;
        this.content = content;
        this.nodes = nodes;
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

        label.className = "label";
        label.id = `${this.id}-content-controllers-${propertyNoSpaces}-info-property`;
        label.appendChild(document.createTextNode(property));

        value.className = "value";
        value.id = `${this.id}-content-controllers-${propertyNoSpaces}-info-value`;
        // there is a bug with range between 0-0.9: (0,0.5) = 0, [0.5,1) = 1
        // thus showing "real" range value before user interaction
        if (initialValue >= 0 && initialValue < 0.5) initialValue = 0;
        if (initialValue >= 0.5 && initialValue < 1) initialValue = 1;

        value.appendChild(document.createTextNode(initialValue));

        unit.className = "value";
        unit.id = `${this.id}-content-controllers-${propertyNoSpaces}-info-units`;
        unit.appendChild(document.createTextNode(units));

        valueUnit.className = "value-unit";
        valueUnit.appendChild(value);
        valueUnit.appendChild(unit);

        valueUnit.value = value;
        valueUnit.unit = unit;

        info.className = "slider-info";
        info.id = `${this.id}-content-controllers-${propertyNoSpaces}-info`;
        info.appendChild(label);
        info.appendChild(valueUnit);

        info.label = label;

        slider.id = `${this.id}-content-controllers-${propertyNoSpaces}-slider`;
        slider.type = "range";
        slider.scaleLog = scaleLog;
        slider.min = min;
        slider.max = max;
        slider.minFloat = parseFloat(min);
        slider.maxFloat = parseFloat(max);
        // set inital value to the correct position before user starts to play
        slider.value = scaleLog ? valueToLogPosition(initialValue, min, max) : initialValue;
        slider.step = stepUnits;
        slider.oninput = function () {
            let sliderValue = scaleLog ? logPositionToValue(this.value, min, max) : this.value;

            if (this.audioNode) this.audioNode[propertyNoSpaces].value = sliderValue;

            // in case user is just playing around without audio on
            value.innerHTML = sliderValue;
        };

        sliderWraper.className = "input-wrapper";
        sliderWraper.appendChild(slider);

        sliderDiv.className = "slider";
        sliderDiv.id = `${this.id}-content-controllers-${propertyNoSpaces}`;
        sliderDiv.appendChild(info);
        sliderDiv.appendChild(sliderWraper);

        sliderDiv.info = info;
        sliderDiv.slider = slider;

        this.content.controllers.appendChild(sliderDiv);

        this.content.controllers[property] = sliderDiv;
        this.content.controllers[property].value = value;
        this.content.controllers[property].unit = unit;

        audioParam.id = `${this.id}-footer-parameter-${propertyNoSpaces}`;
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
        // Get cursor position with respect to the page.
        let x = event.clientX + window.scrollX;
        let y = event.clientY + window.scrollY;

        // Save starting positions of cursor and element.
        this.cursorStartX = x;
        this.cursorStartY = y;

        this.elStartLeft = parseInt(this.module.style.left, 10) || 0;
        this.elStartTop = parseInt(this.module.style.top, 10) || 0;

        // Update element's z-index.
        ++this.module.style.zIndex;

        // Capture mousemove and mouseup events on the page.
        whileMovingModuleHandler = (event) => {
            this.whileMovingModule(event);
        };

        document.addEventListener("mousemove", whileMovingModuleHandler, true);
        document.addEventListener("mouseup", stopMovingModule, true);
        event.preventDefault();
    }
    whileMovingModule(event) {
        // Get cursor position with respect to the page.
        let x = event.clientX + window.scrollX;
        let y = event.clientY + window.scrollY;
        let module = this.module;

        // Move drag element by the same amount the cursor has moved.
        module.style.left = module.elStartLeft + x - module.cursorStartX + 2 + "px";
        module.style.top = module.elStartTop + y - module.cursorStartY + 5 + "px";

        if (module.incomingCables) {
            // update any lines that point in here.

            let off = module;
            x = window.scrollX + 12;
            y = window.scrollY + 12;

            while (off) {
                x += off.offsetLeft;
                y += off.offsetTop;
                off = off.offsetParent;
            }

            module.incomingCables.forEach((cable) => {
                cable.updateEndPoint(x, y);
            });
        }

        if (module.outcomingCables) {
            // update any lines that point out of here.
            let off = module.outputs;
            x = window.scrollX + 12;
            y = window.scrollY + 12;

            while (off) {
                x += off.offsetLeft;
                y += off.offsetTop;
                off = off.offsetParent;
            }

            module.outcomingCables.forEach((cable) => {
                cable.updateStartPoint(x, y);
            });
        }

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
        if (this.head && this.head.diode) destinationModule.head.diode.classList.add("diode-on");
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
    getBoundingClientRect(direction) {
        if (direction === "right") return this.module.getBoundingClientRect().right;
        if (direction === "top") return this.module.getBoundingClientRect().top;
    }
}
