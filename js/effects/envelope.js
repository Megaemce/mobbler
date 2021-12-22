import Module from "../classes/Module.js";
import Parameter from "../classes/Parameter.js";
import { displayAlertOnElement, buildEnvelope, changePathInSVG } from "../helpers/builders.js";
import { scaleBetween, valueToLogPosition } from "../helpers/math.js";
import { modules, cables } from "../main.js";

export default function enveloper(event, initalDelay, initalAttack, initalHold, initalDecay, initalSustain, initalRelease) {
    const hold = parseFloat(initalHold || 750);
    const delay = parseFloat(initalDelay || 0);
    const decay = parseFloat(initalDecay || 850);
    const attack = parseFloat(initalAttack || 400);
    const sustain = parseFloat(initalSustain || 20);
    const release = parseFloat(initalRelease || 550);
    const holdInfo = "Number of second by which sound will be played on the sustain level";
    const delayInfo = "Number of second by which envelope start will be delayed";
    const decayInfo = "Time taken for the subsequent run down from the attack level to the designated sustain level";
    const attackInfo = "Time taken for initial run-up of level from nil to peak, beginning when the key is pressed";
    const sustainInfo = "Level during the main sequence of the sound's duration, until the key is released";
    const releaseInfo = "Time taken for the level to decay from the sustain level to zero after the key is released";

    let pointDelay = delay / 10;
    let pointAttack = pointDelay + attack / 10;
    let pointDecay = pointAttack + decay / 10;
    let pointSustain = 100 - sustain / 10;
    let pointHold = pointDecay + hold / 10;
    let pointRelease = pointHold + release / 10;

    const module = new Module("envelope", false);

    const visualizer = buildEnvelope(module, pointDelay, pointAttack, pointDecay, pointSustain, pointHold, pointRelease);

    // set inital path (from slider inital values) in envelope svg
    changePathInSVG(visualizer, pointDelay, pointAttack, pointDecay, pointSustain, pointHold, pointRelease);

    module.createSlider("delay", delay, 0, 1000, 1, "ms", true, delayInfo);
    module.createSlider("attack", attack, 0, 1000, 1, "ms", true, attackInfo);
    module.createSlider("decay", decay, 0, 1000, 1, "ms", true, decayInfo);
    module.createSlider("sustain", sustain, 0, 100, 1, "%", false, sustainInfo);
    module.createSlider("hold", hold, 0, 1000, 1, "ms", true, holdInfo);
    module.createSlider("release", release, 1, 1000, 1, "ms", true, releaseInfo);

    // functions used when specific parameter is changed. Reverse slider order.
    function releaseSetFunction() {
        pointRelease = pointHold + module.audioNode.release.value / 10;
        visualizer.release.setAttribute("cx", pointRelease);

        // update path after all other values are updated too
        changePathInSVG(visualizer, pointDelay, pointAttack, pointDecay, pointSustain, pointHold, pointRelease);
    }
    function holdSetFunction() {
        pointHold = pointDecay + module.audioNode.hold.value / 10;
        visualizer.hold.setAttribute("cx", pointHold);
        visualizer.hold.setAttribute("cy", pointSustain);
        releaseSetFunction();
    }
    function sustainSetFunction() {
        pointSustain = 100 - module.audioNode.sustain.value;
        visualizer.decay.setAttribute("cy", pointSustain);
        holdSetFunction();
    }
    function decaySetFunction() {
        pointDecay = pointAttack + module.audioNode.decay.value / 10;
        visualizer.decay.setAttribute("cx", pointDecay);
        sustainSetFunction();
    }
    function attackSetFunction() {
        pointAttack = pointDelay + module.audioNode.attack.value / 10;
        visualizer.attack.setAttribute("cx", pointAttack);
        decaySetFunction();
    }
    function delaySetFunction() {
        pointDelay = module.audioNode.delay.value / 10;
        visualizer.delay.setAttribute("cx", pointDelay);
        attackSetFunction(); // update other value as they depand on each other
    }

    module.audioNode = {
        type: "envelope", // used by connectToSlider and connectToParameter
        hold: new Parameter(hold, holdSetFunction),
        delay: new Parameter(delay, delaySetFunction),
        decay: new Parameter(decay, decaySetFunction),
        attack: new Parameter(attack, attackSetFunction),
        sustain: new Parameter(sustain, sustainSetFunction),
        release: new Parameter(release, releaseSetFunction),
        intervalID: undefined, // used to stop animation when reconnecting
        connectedModules: new Array(), // keeping all info about connected modules
        updateConnectedSlider() {
            const pathLength = visualizer.path.getTotalLength().toFixed(0);

            // collect pathLength points and time between points (delta x)
            const pathPoints = [];
            for (let i = 0; i <= pathLength; i++) {
                const point = {};
                point.x = parseFloat(visualizer.path.getPointAtLength(i).x.toFixed(2));
                point.y = parseFloat(visualizer.path.getPointAtLength(i).y.toFixed(2));
                point.time = parseFloat(visualizer.path.getPointAtLength(i + 1).x) - point.x;
                pathPoints.push(point);
            }

            // reset current value path to zero
            visualizer.currentPath.setAttribute("d", "M0,100");

            // reduce array to element that don't lay on the straight vertical line (calling too many setTimeouts is just slow)
            const reducedPathPoints = [pathPoints[0]];
            for (let i = 1; i < pathPoints.length; i++) {
                if (pathPoints[i - 1].x !== pathPoints[i].x && Math.abs(pathPoints[i - 1].y - pathPoints[i].y) !== 1) {
                    reducedPathPoints.push(pathPoints[i - 1]);
                }
            }

            const iterator = reducedPathPoints[Symbol.iterator]();

            const iterating = () => {
                const point = iterator.next();

                // if iteration is not done refresh sliders on all connected modules
                if (point.done === false) {
                    clearInterval(this.intervalID);

                    this.connectedModules.forEach((module) => {
                        // copy-pasta from connectToSlider(). It's not located there as it was an exception
                        // for almost all of the function thus kept here for better clarity in the Module class
                        const slider = module.slider;
                        const sliderMin = parseFloat(slider.min);
                        const sliderMax = parseFloat(slider.max);
                        const destination = module.destination;
                        const parameterType = module.parameterType;
                        const sliderDecimals = slider.step.split(".")[1] ? slider.step.split(".")[1].length : 0;
                        const sliderInitalValue = module.sliderInitalValue;

                        // scale value from [100,0] (0 is max thus scale is reversed) to [sliderMin, sliderInitalValue]
                        let scaledValue = scaleBetween(point.value.y, 100, 0, sliderMin, sliderInitalValue);

                        // update slider's audioNode
                        if (destination.audioNode) destination.audioNode[parameterType].value = scaledValue;

                        // change slider position if scaleLog option is enabled
                        slider.value = slider.scaleLog ? valueToLogPosition(scaledValue, sliderMin, sliderMax) : scaledValue;

                        // cut decimals so they fit to the decimals of slider.step
                        scaledValue = parseFloat(scaledValue).toFixed(sliderDecimals);

                        // show value in debug console and above the slider
                        destination.content.controllers[parameterType].value.innerHTML = scaledValue;
                        destination.content.controllers[parameterType].debug.currentValue.innerText = scaledValue;
                    });

                    // move time with new value on time axis
                    visualizer.timeValue.setAttribute("x", point.value.x - 40);
                    visualizer.timeValue.setAttribute("y", 115);
                    visualizer.timeValue.innerHTML = `${(point.value.x / 100).toFixed(2)}s`;
                    visualizer.timeAxisValueLine.setAttribute("d", `M${point.value.x},100 L${point.value.x},115`);

                    // move amp value on amp axis
                    visualizer.ampAxisText.setAttribute("y", point.value.y + 5); // 5 is half of font size
                    visualizer.ampAxisValueLine.setAttribute("d", `M505,${point.value.y} L490,${point.value.y}`);

                    // update current value path
                    const updatedPath = `${visualizer.currentPath.getAttribute("d")} L${point.value.x},${point.value.y},${point.value.x},100`;
                    visualizer.currentPath.setAttribute("d", updatedPath);

                    // start new iteration
                    this.intervalID = setInterval(iterating, point.value.time);
                } else {
                    // when the whole path is fisnihed run the cycle again
                    if (this.loop === true && reducedPathPoints.length > 1) {
                        this.updateConnectedSlider();
                    }
                }
            };

            iterating();
        },
        connect(destination) {
            // in all places where connection is done destination will have parentID attribute set
            const destinationModule = modules[destination.parentID];

            // don't connect to input, only to parameters
            if (destination.parameterType) {
                const sliderDiv = destinationModule.content.controllers[destination.parameterType];

                // disable slider
                sliderDiv.slider.classList.add("disabled");

                // add new module into connectedModules array
                this.connectedModules.push({
                    id: destination.parentID,
                    destination: destinationModule,
                    parameterType: destination.parameterType,
                    slider: sliderDiv.slider,
                    sliderInitalValue: parseFloat(sliderDiv.value.innerHTML),
                });

                if (this.connectedModules.length > 1) {
                    displayAlertOnElement("It's better NOT to connect envelope to multiple modules", destinationModule.head, 3);
                }

                // allow loop to start. When there is more than one module connected to envelope don't rerun the function
                if (this.loop === false) {
                    this.loop = true;

                    // clearInterval(this.intervalID);
                    // start the show
                    this.updateConnectedSlider();
                }
            } else {
                // removing cable too fast would make input image set to busy
                setTimeout(() => {
                    module.outcomingCables[module.outcomingCables.length - 1].deleteCable();
                }, 100);
                displayAlertOnElement("Please connect to the parameter instead of input", destinationModule.head, 3);
            }
        },
        disconnect() {
            // cancel the show on all connected modules
            this.connectedModules.forEach((module) => {
                module.destination && window.cancelAnimationFrame(module.destination.animationID[module.parameterType]);
            });
            // flush existing connection
            this.connectedModules = [];
            this.loop = false;
        },
    };

    module.isTransmitting = true;
    module.audioNode.loop = false;
    module.addInitalCable();
}
