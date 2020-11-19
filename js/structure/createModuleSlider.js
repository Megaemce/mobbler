import audioContext from '../main.js'

function logSlider(position, min, max, digitsAfterDot) {
    // calculate adjustment factor
    let scale = (Math.log(max) - Math.log(min || 1)) / (max - min);
    return (Math.exp((position - min) * scale + Math.log(min || 1))).toFixed(digitsAfterDot);
}

function logPosition(value, min, max, digitsAfterDot) {
    // calculate adjustment factor
    let scale = (Math.log(max) - Math.log(min || 1)) / (max - min);
    return (min + (Math.log(value || 1) - Math.log(min || 1)) / scale).toFixed(digitsAfterDot);
}

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
    let moduleControllers = document.getElementById(`${module.id}-content-controllers`)
    let footer = document.getElementById(`${module.id}-footer`)
    let sliderValue = undefined;

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

    info.className = "slider-info";
    info.id = `${module.id}-content-controllers-${propertyNoSpaces}-info`
    info.appendChild(label);
    info.appendChild(valueUnit);

    slider.id = `${module.id}-content-controllers-${propertyNoSpaces}-input`
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.value = scaleLog ? logPosition(initialValue, min, max, 2) : initialValue;
    slider.step = stepUnits;
    slider.oninput = function () {
        sliderValue = this.value

        if (scaleLog)
            sliderValue = logSlider(this.value, min, max, 2)

        if (module.audioNode)
            module.audioNode[propertyNoSpaces].value = sliderValue;

        // in case user is just playing around without audio on
        value.innerHTML = sliderValue;
    }
    slider.onConnectParameter = function (sourceModule) {
        if (!sourceModule.audioNode) return
        let slider = this;

        slider.classList.add("disabled");
        slider.audioNode = audioContext.createAnalyser();

        sourceModule.audioNode.connect(slider.audioNode);

        let bufferLength = slider.audioNode.fftSize = 32;
        let dataArray = new Uint8Array(bufferLength);

        // use arrow function to pass slider (as a this)
        function drawWave() {
            slider.audioNode.getByteTimeDomainData(dataArray);

            dataArray.forEach((element) => {
                slider.value = scaleLog ? logPosition(element, min, max, 2) : element;

                if (scaleLog)
                    sliderValue = logSlider(slider.value, min, max, 2)

                if (module.audioNode)
                    module.audioNode[propertyNoSpaces].value = sliderValue;
            });

            setTimeout(() => {
                requestAnimationFrame(drawWave);
            }, 1000 / 5);
        }

        drawWave();
    }

    sliderWraper.className = "input-wrapper";
    sliderWraper.appendChild(slider)

    sliderDiv.classList.add("slider", `log-slider-is-${scaleLog}`);
    sliderDiv.id = `${module.id}-content-controllers-${property}`
    sliderDiv.appendChild(info);
    sliderDiv.appendChild(sliderWraper);

    moduleControllers.appendChild(sliderDiv);

    audioParam.id = `${module.id}-footer-parameter-${propertyNoSpaces}`
    audioParam.type = propertyNoSpaces; //keep it for stopMovingCable
    audioParam.className = "audio-parameter"

    footer.appendChild(audioParam)

    return slider;
}