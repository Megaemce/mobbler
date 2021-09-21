import { valueToLogPosition } from "../helpers/math.js";
import Line from "../classes/Line.js";

let tempx = 50,
    tempy = 100;

export function addOpenFileButtonTo(element) {
    let input = document.createElement("input");
    let button = document.createElement("button");
    let option = document.createElement("option");

    input.style = "display: none;";
    input.type = "file";
    input.id = "file-input";

    button.innerText = "Open file...";
    button.id = "button";

    option.id = "file button";
    option.appendChild(button);
    option.appendChild(input);

    element.appendChild(option);
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
    let close = document.createElement("a");
    let content = document.createElement("div");
    let options = document.createElement("div");
    let controllers = document.createElement("div");
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
    close.className = "close";
    close.href = "#";

    // moudule.head
    head.className = "head";
    head.style.cursor = "grab";
    head.appendChild(titleWrapper);
    head.appendChild(close);
    head.close = close;
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

        img.src = "../img/cinch_in_side.svg";

        socket.className = "socketWrapper";
        socket.style.cursor = "crosshair";
        socket.parentModule = module; // keep info about parent for movingCable
        socket.type = "input"; // keep info about type for movingCable
        socket.appendChild(img);
        moduleDiv.appendChild(socket);
        moduleDiv.input = img;
    }

    // module.footer
    footer.className = "footer";

    moduleDiv.setAttribute("audioNodeType", module.name);
    moduleDiv.appendChild(head);
    moduleDiv.appendChild(content);
    moduleDiv.appendChild(footer);

    module.head = head;
    module.content = content;
    module.footer = footer;

    // add the node into the soundfield
    modulesDiv.appendChild(moduleDiv);
}

export function buildModuleSlider(module, property, initialValue, min, max, stepUnits, units, scaleLog) {
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

    // module.content.cotrollers.$propertyNoSpaces.info.valueUnit.value
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
    info.valueUnit = valueUnit;
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

    sliderWraper.className = "input-wrapper";
    sliderWraper.appendChild(slider);

    // module.content.cotrollers.$propertyNoSpaces
    sliderDiv.className = "slider";
    sliderDiv.appendChild(info);
    sliderDiv.appendChild(sliderWraper);
    sliderDiv.info = info;
    sliderDiv.slider = slider;

    module.content.controllers.appendChild(sliderDiv);
    module.content.controllers[propertyNoSpaces] = sliderDiv;
    module.content.controllers[propertyNoSpaces].value = value;
    module.content.controllers[propertyNoSpaces].unit = unit;

    // module.footer.$propertyNoSpaces
    audioParam.type = propertyNoSpaces; //keep it for stopMovingCable
    audioParam.parentModule = module; // keep info about parent for stopMovingCable
    audioParam.className = "audio-parameter";

    module.footer.appendChild(audioParam);
    module.footer[propertyNoSpaces] = audioParam;
}

export function buildCable(cable) {
    let xPosition = cable.source.modulePosition.right;
    let yPosition = cable.source.modulePosition.top + 10;
    let shapeUnfoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    let shapeFoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    let jackRotateAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
    let svg = document.getElementById("svgCanvas");

    cable.jack.setAttribute("href", "./img/jack_cleared_nocable.svg");
    cable.jack.setAttribute("height", "9");
    cable.jack.setAttribute("id", `${cable.source.id}-jack`);
    cable.jack.style.cursor = "grab";

    // move original shape to the position on the right top of module
    cable.points.forEach((point, i) => {
        point.move(xPosition, yPosition);
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
