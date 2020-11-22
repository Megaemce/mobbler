import {
    valueToLogPosition,
    logPositionToValue,
} from '../helpers/math.js'

export default function createModuleSlider(module, property, initialValue, min, max, stepUnits, units, scaleLog) {
    let propertyNoSpaces = property.split(' ').join('')
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
    label.id = `${module.id}-content-controllers-${propertyNoSpaces}-info-property`
    label.appendChild(document.createTextNode(property));

    value.className = "value";
    value.id = `${module.id}-content-controllers-${propertyNoSpaces}-info-value`
    // there is a bug with range between 0-0.9: (0,0.5) = 0, [0.5,1) = 1 
    // thus showing "real" range value before user interaction
    if (initialValue >= 0 && initialValue < 0.5)
        initialValue = 0;
    if (initialValue >= 0.5 && initialValue < 1)
        initialValue = 1;

    value.appendChild(document.createTextNode(initialValue));

    unit.className = "value";
    unit.id = `${module.id}-content-controllers-${propertyNoSpaces}-info-units`
    unit.appendChild(document.createTextNode(units));

    valueUnit.className = "value-unit"
    valueUnit.appendChild(value);
    valueUnit.appendChild(unit);

    valueUnit.value = value;
    valueUnit.unit = unit;

    info.className = "slider-info";
    info.id = `${module.id}-content-controllers-${propertyNoSpaces}-info`
    info.appendChild(label);
    info.appendChild(valueUnit);

    info.label = label;

    slider.id = `${module.id}-content-controllers-${propertyNoSpaces}-slider`
    slider.type = "range";
    slider.scaleLog = scaleLog
    slider.min = min;
    slider.max = max;
    // set inital value to the correct position before user starts to play
    slider.value = scaleLog ? valueToLogPosition(initialValue, min, max) : initialValue;
    slider.step = stepUnits;
    slider.oninput = function () {
        let sliderValue = scaleLog ? logPositionToValue(this.value, min, max) : this.value

        if (module.audioNode)
            module.audioNode[propertyNoSpaces].value = sliderValue;

        // in case user is just playing around without audio on
        value.innerHTML = sliderValue;
    }

    sliderWraper.className = "input-wrapper";
    sliderWraper.appendChild(slider)

    sliderDiv.className = "slider";
    sliderDiv.id = `${module.id}-content-controllers-${propertyNoSpaces}`
    sliderDiv.appendChild(info);
    sliderDiv.appendChild(sliderWraper);

    sliderDiv.info = info;
    sliderDiv.slider = slider;

    module.content.controllers.appendChild(sliderDiv);

    module.content.controllers[property] = sliderDiv;
    module.content.controllers[property].value = value;
    module.content.controllers[property].unit = unit;

    audioParam.id = `${module.id}-footer-parameter-${propertyNoSpaces}`
    audioParam.type = propertyNoSpaces; //keep it for stopMovingCable
    audioParam.className = "audio-parameter"

    module.footer.appendChild(audioParam)

    module.footer[propertyNoSpaces] = audioParam;
}