import Line from "../classes/Line.js";
import { modules } from "../main.js";
import { valueToLogPosition } from "../helpers/math.js";

// used by buildModule function to locate new modules on the screen
let tempx = 50;
let tempy = 100;

/* add button "open file..." that allows user to add file into the select */
export function addOpenFileButtonTo(selectDiv) {
    const input = document.createElement("input");
    const button = document.createElement("button");
    const fileButton = document.createElement("option");

    input.style = "display: none;";
    input.type = "file";

    button.innerText = "Open file...";

    fileButton.id = "file button";
    fileButton.appendChild(button);
    fileButton.appendChild(input);
    // module.content.options.select.fileButton.input
    fileButton.input = input;

    // module.content.options.select.fileButton
    selectDiv.appendChild(fileButton);
    selectDiv.fileButton = fileButton;
}
/* show message popup on the element for timeInSec seconds */
export function displayAlertOnElement(message, element, timeInSec) {
    const time = timeInSec === undefined ? 1000 : parseFloat(timeInSec) * 1000;
    let span;

    if (element === undefined) return;

    const previousAlert = element.getElementsByClassName("alertText")[0];

    // don't replicate the same alert
    if (previousAlert && previousAlert.innerHTML === message) {
        span = previousAlert;
        span.style.visibility = "visible";
        span.style.opacity = "1";
    } else {
        span = document.createElement("span");

        span.className = "alertText";
        span.innerHTML = message;

        element.classList.add("alert");
        element.appendChild(span);
    }

    setTimeout(() => {
        span.style.visibility = "hidden";
        span.style.opacity = "0";
    }, time);
}
/* currently not used. Make selection rectangle on canvas */
export function createSelectionRectangle(event) {
    const div = document.getElementById("selection-rect");
    const x1 = event.clientX;
    const y1 = event.clientY;

    document.onmousemove = (event) => {
        const x2 = event.clientX;
        const y2 = event.clientY;
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
/* build HTML structure for module */
export function buildModule(module) {
    const head = document.createElement("div");
    const close = document.createElement("button");
    const title = document.createElement("span");
    const footer = document.createElement("div");
    const content = document.createElement("div");
    const options = document.createElement("div");
    const buttons = document.createElement("div");
    const leftSide = document.createElement("div");
    const frontSide = document.createElement("div");
    const moduleDiv = document.createElement("div");
    const modulesDiv = document.getElementById("modules");
    const controllers = document.createElement("div");
    const titleWrapper = document.createElement("div");
    const moduleNumber = parseInt(module.id.slice(7, module.id.length));
    const leftAndFrontSide = document.createElement("div");

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
        const select = document.createElement("select");

        module.arrayForSelect.forEach((object) => {
            const option = document.createElement("option");
            option.appendChild(document.createTextNode(object));
            select.add(option);
        });

        options.appendChild(select);
        options.select = select;
    }

    if (module.hasLooper) {
        const label = document.createElement("label");
        const looper = document.createElement("div");
        const checkbox = document.createElement("input");
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
        const label = document.createElement("label");
        const normalizer = document.createElement("div");
        const checkbox = document.createElement("input");
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
        const socket = document.createElement("div");
        const img = document.createElement("img");

        // keep info about parent and type in image and it's wrapper for movingCable function
        img.src = "./img/input.svg";
        img.inputName = "input";
        img.parentModuleID = module.id;

        socket.className = "socket-wrapper";
        socket.inputName = "input";
        socket.parentModuleID = module.id;
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
/* build HTML structure for slider */
export function buildModuleSlider(module, property, initialValue, min, max, stepUnits, units, scaleLog, propertyInfo) {
    const unit = document.createElement("span");
    const info = document.createElement("div");
    const value = document.createElement("span");
    const label = document.createElement("div");
    const slider = document.createElement("input");
    const sliderDiv = document.createElement("div");
    const valueUnit = document.createElement("div");
    const labelSpan = document.createElement("span");
    const labelInfo = document.createElement("span");
    const debugValue = document.createElement("span");
    const audioParam = document.createElement("div");
    const sliderDebug = document.createElement("div");
    const sliderWraper = document.createElement("div");
    const parameterImg = document.createElement("img");
    const debugValueDiv = document.createElement("div");
    const parameterType = property.split(" ").join("");
    const debugValueMin = document.createElement("span");
    const debugValueMax = document.createElement("span");
    const debugValueStep = document.createElement("span");
    const debugHideButton = document.createElement("button");
    const debugValueMinDiv = document.createElement("div");
    const debugValueMaxDiv = document.createElement("div");
    const debugValueStepDiv = document.createElement("div");

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

    debugValueDiv.className = "debug-text";
    debugValueMinDiv.className = "debug-text";
    debugValueMaxDiv.className = "debug-text";
    debugValueStepDiv.className = "debug-text";

    debugValueDiv.appendChild(document.createTextNode("Current: "));
    debugValueMinDiv.appendChild(document.createTextNode("Min: "));
    debugValueMaxDiv.appendChild(document.createTextNode("Max: "));
    debugValueStepDiv.appendChild(document.createTextNode("Step: "));

    debugValue.appendChild(document.createTextNode(scaleLog ? parseFloat(initialValue) : slider.value));
    debugValueMin.appendChild(document.createTextNode(slider.min));
    debugValueMax.appendChild(document.createTextNode(slider.max));
    debugValueStep.appendChild(document.createTextNode(slider.step));

    debugValue.setAttribute("contenteditable", true);
    debugValueMin.setAttribute("contenteditable", true);
    debugValueMax.setAttribute("contenteditable", true);
    debugValueStep.setAttribute("contenteditable", true);

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

    debugValueDiv.appendChild(debugValue);
    debugValueMinDiv.appendChild(debugValueMin);
    debugValueMaxDiv.appendChild(debugValueMax);
    debugValueStepDiv.appendChild(debugValueStep);

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
        const sliders = document.createElement("div");
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
    parameterImg.inputName = parameterType;
    parameterImg.parentModuleID = module.id;

    // module.footer.$parameterType
    audioParam.inputName = parameterType;
    audioParam.parentModuleID = module.id;
    audioParam.className = "parameter-wrapper";
    audioParam.appendChild(parameterImg);
    audioParam.img = parameterImg;

    module.footer.appendChild(audioParam);
    module.footer[parameterType] = audioParam;
}
/* build HTML (and SVG) structure for cable */
export function buildCable(cable) {
    const svg = document.getElementById("svgCanvas");
    const xPosition = parseFloat(modules[cable.sourceID].modulePosition.right);
    const yPosition = parseFloat(modules[cable.sourceID].modulePosition.top) + 10;
    const shapeUnfoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    const shapeFoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    const jackRotateAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");

    cable.jack.setAttribute("href", "./img/jack.svg");
    cable.jack.setAttribute("height", "9");
    cable.jack.setAttribute("id", `${cable.sourceID}-jack`);

    // move original shape to the position on the right top of module
    cable.points.forEach((point, i) => {
        point.moveBy(xPosition, yPosition);
        if (i > 0) {
            // newLine keeps the array with pointers linked to Points which is cool!
            // by updating the line we update the points in the points array too
            const newLine = new Line(cable.points[i - 1], cable.points[i], Math.log(point.x), 0.8);
            cable.lines.push(newLine);
        }
    });

    // translate points to actual svg shape (polyline)
    // pointsToString is Cable class function
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
/* build HTML structure for output final mixer */
export function buildMixer() {
    // if console was already created don't bother
    if (!document.getElementById("mixer-controllers")) {
        const footer = document.getElementById("mixer");
        const hideButton = document.createElement("button");
        const hideButtonDiv = document.createElement("div");
        const controllers = document.createElement("div");

        hideButton.className = "hide-button";

        hideButtonDiv.className = "hide-wrapper";
        hideButtonDiv.appendChild(document.createTextNode("MIXER"));
        hideButtonDiv.appendChild(hideButton);
        hideButtonDiv.onclick = () => {
            if (controllers.classList.contains("show")) controllers.classList.remove("show");
            else controllers.classList.add("show");
            if (hideButton.classList.contains("show")) hideButton.classList.remove("show");
            else hideButton.classList.add("show");
        };

        controllers.id = "mixer-controllers";
        controllers.className = "controllers nothing";

        footer.appendChild(hideButtonDiv);
        footer.appendChild(controllers);
        footer.hideButton = hideButton;
    }
}
/* build HTML structure within mixer div for module's channel */
export function addModuleToMixer(module) {
    const muteDiv = document.createElement("div");
    const soloDiv = document.createElement("div");
    const muteButton = document.createElement("button");
    const soloButton = document.createElement("button");
    const controller = document.createElement("div");
    const moduleName = document.createElement("span");

    const mixerControllers = document.getElementById("mixer-controllers");

    moduleName.appendChild(document.createTextNode(module.name));
    moduleName.className = "moduleName";
    moduleName.onclick = () => {
        moduleName.shake();
    };

    muteButton.className = "mute-button";

    muteDiv.appendChild(document.createTextNode("ON"));
    muteDiv.appendChild(muteButton);
    muteDiv.appendChild(document.createTextNode("OFF"));
    muteDiv.className = "mute-wrapper";

    soloButton.className = "solo-button";

    soloDiv.appendChild(document.createTextNode("SOLO"));
    soloDiv.appendChild(soloButton);
    soloDiv.className = "solo-wrapper";

    controller.className = "mixer-controller";
    controller.appendChild(moduleName);
    controller.appendChild(soloDiv);
    controller.appendChild(muteDiv);

    controller.muteButton = muteButton;
    controller.soloButton = soloButton;
    controller.id = module.id;

    mixerControllers.appendChild(controller);
    mixerControllers[module.id] = controller;
}
/* change SVG path points. Used by envelope */
export function changePathInSVG(svg, pointDelay, pointAttack, pointDecay, pointSustain, pointHold, pointRelease) {
    svg.path.setAttribute("d", `M0,100 L${pointDelay},100,${pointAttack},0,${pointDecay},${pointSustain},${pointHold},${pointSustain},${pointRelease},100`);
}
/* build HTML (and SVG) structure for envelope */
export function buildEnvelope(module, delay, attack, decay, sustain, hold, release) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const ampAxis = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const timeAxis = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const ampValue = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const timeValue = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const pointHold = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const visualizer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const pointStart = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const pointDecay = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const pointDelay = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const currentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const ampAxisText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const pointAttack = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const pointRelease = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const ampAxisArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const timeAxisArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const ampAxisValueLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const timeAxisValueLine = document.createElementNS("http://www.w3.org/2000/svg", "path");

    visualizer.setAttribute("viewBox", "-5 -5 510 110");
    visualizer.setAttribute("preserveAspectRatio", "xMinYMin slice");
    visualizer.classList.add("envelope-visualizer");

    path.classList.add("slider-path");

    // amplitude value, text and axis
    ampValue.innerHTML = "0";
    ampValue.setAttribute("x", 515); // align it to be in the center of current point
    ampValue.setAttribute("y", 105);
    ampValue.classList.add("axis-text");

    ampAxis.setAttribute("d", "M505,0 L505,100");
    ampAxis.classList.add("axis");

    ampAxisText.innerHTML = "AMPLITUDE";
    ampAxisText.setAttribute("x", 400);
    ampAxisText.setAttribute("y", 10);
    ampAxisText.classList.add("axis-text");

    ampAxisArrow.setAttribute("points", "500,10 510,10 505,0");

    // time value and axis
    timeValue.innerHTML = "TIME";
    timeValue.setAttribute("x", -40); // align it to be in the center of current point
    timeValue.setAttribute("y", 120);
    timeValue.classList.add("axis-text");

    timeAxisArrow.setAttribute("points", "495,110 495,120 505,115");

    timeAxis.setAttribute("d", "M0,115 L495,115");
    timeAxis.classList.add("axis");

    currentPath.classList.add("current-path");
    currentPath.setAttribute("d", "M0,100");

    pointStart.setAttribute("cx", 0);
    pointStart.setAttribute("cy", 100);
    pointStart.setAttribute("id", "start");
    pointStart.setAttribute("r", 3);

    pointDelay.setAttribute("cx", delay);
    pointDelay.setAttribute("cy", 100);
    pointDelay.setAttribute("id", "delay");
    pointDelay.setAttribute("r", 3);

    pointAttack.setAttribute("cx", attack);
    pointAttack.setAttribute("cy", 0);
    pointAttack.setAttribute("id", "attack");
    pointAttack.setAttribute("r", 3);

    pointDecay.setAttribute("cx", decay);
    pointDecay.setAttribute("cy", sustain);
    pointDecay.setAttribute("id", "decay");
    pointDecay.setAttribute("r", 3);

    pointHold.setAttribute("cx", hold);
    pointHold.setAttribute("cy", sustain);
    pointHold.setAttribute("id", "attack");
    pointHold.setAttribute("r", 3);

    pointRelease.setAttribute("cx", release);
    pointRelease.setAttribute("cy", 100);
    pointRelease.setAttribute("id", "release");
    pointRelease.setAttribute("r", 3);

    timeAxisValueLine.setAttribute("d", "M0,110 L0,115");
    timeAxisValueLine.classList.add("value-line");

    ampAxisValueLine.classList.add("value-line");

    visualizer.appendChild(ampAxis);
    visualizer.appendChild(ampAxisText);
    visualizer.appendChild(ampAxisArrow);
    visualizer.appendChild(timeAxis);
    visualizer.appendChild(timeAxisArrow);
    visualizer.appendChild(currentPath);
    visualizer.appendChild(path);
    visualizer.appendChild(pointHold);
    visualizer.appendChild(pointStart);
    visualizer.appendChild(pointDelay);
    visualizer.appendChild(pointAttack);
    visualizer.appendChild(pointDecay);
    visualizer.appendChild(pointRelease);
    visualizer.appendChild(timeAxisValueLine);
    visualizer.appendChild(ampAxisValueLine);
    visualizer.appendChild(timeValue); // on the top

    visualizer.path = path;
    visualizer.hold = pointHold;
    visualizer.decay = pointDecay;
    visualizer.delay = pointDelay;
    visualizer.attack = pointAttack;
    visualizer.release = pointRelease;
    visualizer.ampValue = ampValue;
    visualizer.timeValue = timeValue;
    visualizer.currentPath = currentPath;
    visualizer.ampAxisText = ampAxisText;
    visualizer.ampAxisValueLine = ampAxisValueLine;
    visualizer.timeAxisValueLine = timeAxisValueLine;

    module.content.classList.add("envelope");
    module.content.appendChild(visualizer);

    return visualizer;
}
