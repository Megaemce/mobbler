import { valueToLogPosition } from "../helpers/math.js";
import Line from "../classes/Line.js";

let tempx = 50,
    tempy = 100;

export function addOpenFileButtonTo(selectDiv) {
    let input = document.createElement("input");
    let button = document.createElement("button");
    let fileButton = document.createElement("option");

    input.style = "display: none;";
    input.type = "file";
    input.id = "file-input";

    button.innerText = "Open file...";
    button.id = "button";

    fileButton.id = "file button";
    fileButton.appendChild(button);
    fileButton.appendChild(input);
    // module.content.options.select.fileButton.input
    fileButton.input = input;

    // module.content.options.select.fileButton
    selectDiv.appendChild(fileButton);
    selectDiv.fileButton = fileButton;
}

export function displayAlertOnElement(message, element, timeInSec) {
    let span = document.createElement("span");
    let time = timeInSec * 1000 || 1000;

    span.className = "alertText";
    span.innerHTML = message;

    element.classList.add("alert");
    element.appendChild(span);

    setTimeout(() => {
        span.style.visibility = "hidden";
        span.style.opacity = "0";
    }, time);
}

export function createSelectionRectangle(event) {
    let div = document.getElementById("selection-rect");
    let x1 = event.clientX;
    let y1 = event.clientY;

    document.onmousemove = (event) => {
        let x2 = event.clientX;
        let y2 = event.clientY;
        const xMin = Math.min(x1, x2);
        const xMax = Math.max(x1, x2);
        const yMin = Math.min(y1, y2);
        const yMax = Math.max(y1, y2);

        div.style.left = xMin + "px";
        div.style.top = yMin + "px";
        div.style.width = xMax - xMin + "px";
        div.style.height = yMax - yMin + "px";

        div.hidden = 0;
        div.style.zIndex = 100;
    };
    document.onmouseup = () => {
        div.hidden = 1;
        document.onmousemove = undefined;
        document.onmouseup = undefined;
        document.onmousedown = undefined; // create selection only once. Remove later!
    };
}

export function buildModule(module) {
    let modulesDiv = document.getElementById("modules");
    let moduleDiv = document.createElement("div");
    let head = document.createElement("div");
    let titleWrapper = document.createElement("div");
    let title = document.createElement("span");
    let buttons = document.createElement("div");
    let close = document.createElement("button");
    let content = document.createElement("div");
    let options = document.createElement("div");
    let controllers = document.createElement("div");
    let leftSide = document.createElement("div");
    let frontSide = document.createElement("div");
    let leftAndFrontSide = document.createElement("div");
    let footer = document.createElement("footer");
    let moduleNumber = parseInt(module.id.slice(7, module.id.length));

    module.div = moduleDiv;
    module.div.id = module.id;
    module.div.self = module; // just for logging

    moduleDiv.className = "module";
    moduleDiv.style.left = `${tempx}px`;
    moduleDiv.style.top = `${tempy}px`;

    if (tempx > modulesDiv.offsetWidth - 450) {
        tempy += 300;
        tempx = 50 + moduleNumber;
    } else tempx += 300;
    if (tempy > window.innerHeight - 300) tempy = 100 + moduleNumber;

    // module.head.titleWrapper.title
    title.className = "title";
    title.appendChild(document.createTextNode(module.name));
    title.name = module.name;

    // module.head.titleWrapper
    titleWrapper.className = "title-wrapper";
    titleWrapper.appendChild(title);

    // module.head.close
    close.classList.add("close");
    close.classList.add("button");

    // buttons' wrapper
    buttons.className = "buttons-wrapper";
    buttons.appendChild(close);

    // moudule.head
    head.className = "head";
    head.appendChild(titleWrapper);
    head.appendChild(buttons);
    head.close = close;
    head.buttonsWrapper = buttons;
    head.titleWrapper = titleWrapper;

    // module.content.options
    options.className = "options";

    if (module.arrayForSelect) {
        let select = document.createElement("select");

        select.className = "ab-source";

        module.arrayForSelect.forEach((object) => {
            let option = document.createElement("option");
            option.appendChild(document.createTextNode(object));
            select.add(option);
        });

        options.appendChild(select);
        options.select = select;
    }

    if (module.hasLooper) {
        let label = document.createElement("label");
        let looper = document.createElement("div");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        // To associate label with an input element, you need to give the input an id attribute.
        label.htmlFor = `${module.id}-content-options-looper`;
        label.appendChild(document.createTextNode("Loop"));

        looper.className = "looper";
        looper.id = `${module.id}-content-options-looper`;
        looper.appendChild(checkbox);
        looper.appendChild(label);

        looper.checkbox = checkbox;
        looper.label = label;

        moduleDiv.classList.add("has-looper");
        options.appendChild(looper);

        options.looper = looper;
    }

    if (module.hasNormalizer) {
        let label = document.createElement("label");
        let normalizer = document.createElement("div");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        label.htmlFor = `${module.id}-content-options-looper`;
        label.appendChild(document.createTextNode("Norm"));

        normalizer.className = "normalizer";
        normalizer.id = `${module.id}-content-options-normalizer`;
        normalizer.appendChild(checkbox);
        normalizer.appendChild(label);

        normalizer.checkbox = checkbox;
        normalizer.label = label;

        moduleDiv.classList.add("has-normalizer");
        options.appendChild(normalizer);

        options.normalizer = normalizer;
    }

    if (module.hasLooper || module.hasNormalizer || module.arrayForSelect) {
        content.appendChild(options);
        content.options = options;
    }

    // module.content.controllers
    controllers.className = "controllers";

    // module.content
    content.className = "content";
    content.appendChild(controllers);
    content.controllers = controllers;

    if (module.hasInput) {
        // module.input
        let socket = document.createElement("div");
        let img = document.createElement("img");

        // keep info about parent and type in image and it's wrapper for movingCable function
        img.src = "../img/input.svg";
        img.parentModule = module;
        img.inputName = "input";

        socket.className = "socket-wrapper";
        socket.parentModule = module;
        socket.inputName = "input";
        socket.appendChild(img);

        leftSide.appendChild(socket);

        moduleDiv.input = img;
    }
    leftSide.className = "left-side";
    frontSide.className = "front-side";
    leftAndFrontSide.className = "left-and-front-side";

    frontSide.appendChild(head);
    frontSide.appendChild(content);

    leftAndFrontSide.appendChild(leftSide);
    leftAndFrontSide.appendChild(frontSide);

    // module.footer
    footer.className = "footer";

    moduleDiv.setAttribute("audioNodeType", module.name);
    moduleDiv.appendChild(leftAndFrontSide);
    moduleDiv.appendChild(footer);

    module.head = head;
    module.content = content;
    module.footer = footer;

    // add the node into the soundfield
    modulesDiv.appendChild(moduleDiv);
}

export function buildModuleSlider(module, property, initialValue, min, max, stepUnits, units, scaleLog, propertyInfo) {
    const parameterType = property.split(" ").join("");
    let sliderDiv = document.createElement("div");
    let info = document.createElement("div");
    let label = document.createElement("div");
    let labelSpan = document.createElement("span");
    let labelInfo = document.createElement("span");
    let value = document.createElement("span");
    let unit = document.createElement("span");
    let valueUnit = document.createElement("div");
    let slider = document.createElement("input");
    let sliderWraper = document.createElement("div");
    let sliderDebug = document.createElement("div");
    let debugValueMin = document.createElement("span");
    let debugValueMax = document.createElement("span");
    let debugValueStep = document.createElement("span");
    let debugValue = document.createElement("span");
    let debugValueMinDiv = document.createElement("div");
    let debugValueMaxDiv = document.createElement("div");
    let debugValueStepDiv = document.createElement("div");
    let debugValueDiv = document.createElement("div");
    let debugHideButton = document.createElement("button");
    let audioParam = document.createElement("div");
    let parameterImg = document.createElement("img");

    // module.content.controllers.$parameterType.info.label.tooltip
    // module.controllers[$parameterType].info.label.tooltip
    labelInfo.className = "label-tooltip";
    labelInfo.innerHTML = propertyInfo;

    labelSpan.appendChild(document.createTextNode(property));
    labelSpan.className = "label-span";

    // module.content.controllers.$parameterType.info.label
    // or module.controllers[$parameterType].info.label
    label.className = "label";
    label.appendChild(labelInfo);
    label.appendChild(labelSpan);
    label.tooltip = labelInfo;
    label.span = labelSpan;

    // module.content.controllers.$parameterType.info.valueUnit.value
    // or module.controllers[$parameterType].info.valueUnit.value
    // or module.controllers[$parameterType].value
    value.className = "value";
    value.appendChild(document.createTextNode(initialValue));

    // module.content.controllers.$parameterType.info.units
    // or module.controllers[$parameterType].info.units
    unit.className = "value";
    unit.appendChild(document.createTextNode(units));

    valueUnit.className = "value-unit";
    valueUnit.appendChild(value);
    units && valueUnit.appendChild(unit); // sometimes there is no unit
    valueUnit.value = value;
    valueUnit.unit = unit;

    // module.content.controllers.$parameterType.info
    // or module.controllers[$parameterType].info
    info.className = "slider-info";
    info.appendChild(label);
    info.appendChild(valueUnit);
    info.valueUnit = valueUnit;
    info.label = label;

    // module.content.controllers.$parameterType.slider
    // or module.controllers[$parameterType].slider
    slider.type = "range";
    slider.scaleLog = scaleLog;
    slider.min = min;
    slider.max = max;
    slider.step = stepUnits;
    // set inital value to the correct position before user starts to play
    slider.value = scaleLog ? valueToLogPosition(initialValue, min, max) : parseFloat(initialValue);

    debugValueMinDiv.className = "debug-text";
    debugValueMaxDiv.className = "debug-text";
    debugValueStepDiv.className = "debug-text";
    debugValueDiv.className = "debug-text";

    debugValueMinDiv.appendChild(document.createTextNode("Min: "));
    debugValueMaxDiv.appendChild(document.createTextNode("Max: "));
    debugValueStepDiv.appendChild(document.createTextNode("Step: "));
    debugValueDiv.appendChild(document.createTextNode("Current: "));

    debugValueMin.appendChild(document.createTextNode(slider.min));
    debugValueMax.appendChild(document.createTextNode(slider.max));
    debugValueStep.appendChild(document.createTextNode(slider.step));
    debugValue.appendChild(document.createTextNode(scaleLog ? parseFloat(initialValue) : slider.value));

    debugValueMin.setAttribute("contenteditable", true);
    debugValueMax.setAttribute("contenteditable", true);
    debugValueStep.setAttribute("contenteditable", true);
    debugValue.setAttribute("contenteditable", true);

    debugValueMin.oninput = () => {
        slider.min = parseFloat(debugValueMin.innerText);
    };
    debugValueMax.oninput = () => {
        slider.max = parseFloat(debugValueMax.innerText);
    };
    debugValueStep.oninput = () => {
        slider.step = parseFloat(debugValueStep.innerText);
    };
    debugValue.oninput = () => {
        value.innerHTML = parseFloat(debugValue.innerText);
        slider.value = parseFloat(debugValue.innerText);

        // set value on the audiNode parameter
        if (module.audioNode) module.audioNode[parameterType].value = slider.value;
    };

    debugValueMinDiv.appendChild(debugValueMin);
    debugValueMaxDiv.appendChild(debugValueMax);
    debugValueStepDiv.appendChild(debugValueStep);
    debugValueDiv.appendChild(debugValue);

    debugHideButton.className = "hide-button";
    debugHideButton.onclick = () => {
        sliderDebug.classList.remove("show");
    };

    // module.content.controllers.$parameterType.slider.debug or module.controllers[$parameterType].slider.debug
    sliderDebug.className = "slider-debug";
    sliderDebug.appendChild(debugValueMinDiv);
    sliderDebug.appendChild(debugValueMaxDiv);
    sliderDebug.appendChild(debugValueStepDiv);
    sliderDebug.appendChild(debugValueDiv);
    sliderDebug.appendChild(debugHideButton);
    // use in Module to update currentValue textNode when debug opens
    sliderDebug.currentValue = debugValue;

    sliderWraper.className = "input-wrapper";
    sliderWraper.appendChild(slider);

    // module.content.controllers.$parameterType or module.controllers[$parameterType]
    sliderDiv.className = "slider";
    sliderDiv.appendChild(info);
    sliderDiv.appendChild(sliderWraper);
    sliderDiv.appendChild(sliderDebug);
    sliderDiv.info = info;
    sliderDiv.slider = slider;
    sliderDiv.wrapper = sliderWraper;
    sliderDiv.debug = sliderDebug;

    // if sliders div have not been created yet do it
    if (!module.content.controllers.sliders) {
        let sliders = document.createElement("div");
        sliders.className = "sliders";

        module.content.controllers.appendChild(sliders);
        module.content.controllers.sliders = sliders;
    }

    module.content.controllers.sliders.appendChild(sliderDiv);
    module.content.controllers[parameterType] = sliderDiv;
    module.content.controllers[parameterType].value = value;
    module.content.controllers[parameterType].unit = unit;

    // module.footer.$parameterType.img
    // keep info about parent and type in image and it's wrapper for movingCable function
    parameterImg.src = "./img/parameter_input.svg";
    parameterImg.parentModule = module;
    parameterImg.inputName = parameterType;

    // module.footer.$parameterType
    audioParam.inputName = parameterType;
    audioParam.parentModule = module;
    audioParam.className = "parameter-wrapper";
    audioParam.appendChild(parameterImg);
    audioParam.img = parameterImg;

    module.footer.appendChild(audioParam);
    module.footer[parameterType] = audioParam;
}

export function buildCable(cable) {
    let xPosition = cable.source.modulePosition.right;
    let yPosition = cable.source.modulePosition.top + 10;
    let shapeUnfoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    let shapeFoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    let jackRotateAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
    let svg = document.getElementById("svgCanvas");

    cable.jack.setAttribute("href", "./img/jack.svg");
    cable.jack.setAttribute("height", "9");
    cable.jack.setAttribute("id", `${cable.source.id}-jack`);

    // move original shape to the position on the right top of module
    cable.points.forEach((point, i) => {
        point.moveBy(xPosition, yPosition);
        if (i > 0) {
            // newLine keeps the array with pointers linked to Points which is cool!
            // by updating the line we update the points in the points array too
            let newLine = new Line(cable.points[i - 1], cable.points[i], Math.log(point.x), 0.8);
            cable.lines.push(newLine);
        }
    });

    // translate points to actual svg shape (polyline)
    cable.shape.setAttribute("stroke", "#040404");
    cable.shape.setAttribute("fill", "none");
    cable.shape.setAttribute("opacity", "0.9");
    cable.shape.setAttribute("stroke-width", "2");
    cable.shape.setAttribute("points", cable.pointsToString);
    cable.shape.setAttribute("stroke-dasharray", "60");

    svg.appendChild(cable.shape);
    svg.appendChild(cable.jack);

    // unfold cable from starting point
    shapeUnfoldAnimation.setAttribute("attributeName", "stroke-dashoffset");
    shapeUnfoldAnimation.setAttribute("from", "60");
    shapeUnfoldAnimation.setAttribute("to", "0");
    shapeUnfoldAnimation.setAttribute("dur", "1s");
    shapeUnfoldAnimation.setAttribute("fill", "freeze");

    cable.shape.unfoldAnimation = shapeUnfoldAnimation;

    // "from" and "to" attribute will be added when cable is actually folding
    shapeFoldAnimation.setAttribute("attributeName", "points");
    shapeFoldAnimation.setAttribute("dur", "0.5s");
    shapeFoldAnimation.setAttribute("fill", "freeze");

    cable.shape.foldAnimation = shapeFoldAnimation;

    // rotate jack from starting point so it looks like it's attached to the cable (jack.width/2 = 4.5)
    jackRotateAnimation.setAttribute("path", `m ${0.378 + xPosition + 4.5} ${1.056 + yPosition} c 13.622 3.944 18.622 34.944 17.622 52.944`);
    jackRotateAnimation.setAttribute("begin", "0s");
    jackRotateAnimation.setAttribute("dur", "1s");
    jackRotateAnimation.setAttribute("rotate", "auto");
    jackRotateAnimation.setAttribute("fill", "freeze");

    cable.jack.rotateAnimation = jackRotateAnimation;
}
