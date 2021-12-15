import Module from "../classes/Module.js";
import Parameter from "../classes/Parameter.js";
import { displayAlertOnElement, buildEnvelope, changePathInSVG } from "../helpers/builders.js";
import { logPositionToValue } from "../helpers/math.js";
import { modules, cables } from "../main.js";

export default function enveloper(event, initalDelay, initalAttack, initalHold, initalDecay, initalSustain, initalRelease) {
    const hold = parseFloat(initalHold || 750);
    const delay = parseFloat(initalDelay || 0);
    const decay = parseFloat(initalDecay || 850);
    const attack = parseFloat(initalAttack || 400);
    const sustain = parseFloat(initalSustain || 200);
    const release = parseFloat(initalRelease || 550);
    const holdInfo = "Number of second by which max sound will be played";
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

    module.createSlider("delay", delay, 0, 1000, 1, "ms", false, delayInfo);
    module.createSlider("attack", attack, 0, 1000, 1, "ms", false, attackInfo);
    module.createSlider("decay", decay, 0, 1000, 1, "ms", false, decayInfo);
    module.createSlider("sustain", sustain, 0, 1000, 1, "", false, sustainInfo);
    module.createSlider("hold", hold, 0, 1000, 1, "ms", false, holdInfo);
    module.createSlider("release", release, 1, 1000, 1, "ms", false, releaseInfo);

    // reverse slider order. Update path after all other values are updated too
    // functions used when specific parameter is changed. Extract -5 as half of the square width/height
    function releaseSetFunction() {
        pointRelease = pointHold + module.audioNode.release.value / 10;
        visualizer.release.setAttribute("cx", pointRelease);
        changePathInSVG(visualizer, pointDelay, pointAttack, pointDecay, pointSustain, pointHold, pointRelease);
    }
    function holdSetFunction() {
        pointHold = pointDecay + module.audioNode.hold.value / 10;
        visualizer.hold.setAttribute("cx", pointHold);
        visualizer.hold.setAttribute("cy", pointSustain);
        releaseSetFunction();
    }
    function sustainSetFunction() {
        pointSustain = 100 - module.audioNode.sustain.value / 10;
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
        hold: new Parameter(hold, holdSetFunction),
        delay: new Parameter(delay, delaySetFunction),
        decay: new Parameter(decay, decaySetFunction),
        attack: new Parameter(attack, attackSetFunction),
        sustain: new Parameter(sustain, sustainSetFunction),
        release: new Parameter(release, releaseSetFunction),
        sleep: (milliseconds) => {
            // slow down "for" loop to update slider according to envelope time
            return new Promise((resolve) => setTimeout(resolve, milliseconds));
        },
        async updateConnectedSlider() {
            const pathLength = visualizer.path.getTotalLength().toFixed(0);

            // collect pathLength points (not too much not to small)
            let pathPoints = [];
            for (let i = 0; i <= pathLength; i++) {
                const point = {};
                point.x = parseFloat(visualizer.path.getPointAtLength(i).x.toFixed(2));
                point.y = parseFloat(visualizer.path.getPointAtLength(i).y.toFixed(2));
                pathPoints.push(point);
            }

            // reset current value path to zero
            visualizer.currentPath.setAttribute("d", "M0,100");

            // reduce array to element that don't lay on the straight vertical line (calling too many promises is slow)
            let reducedPathPoints = [pathPoints[0]];
            for (let i = 1; i < pathPoints.length; i++) {
                if (pathPoints[i - 1].x !== pathPoints[i].x && Math.abs(pathPoints[i - 1].y - pathPoints[i].y) !== 1) {
                    reducedPathPoints.push(pathPoints[i - 1]);
                }
            }

            for (let i = 1; i < reducedPathPoints.length; i++) {
                const timeBetweenPoints = (reducedPathPoints[i].x - reducedPathPoints[i - 1].x) * 10; // scaled to milliseconds
                // scale value from [0,100] to [this.sliderMin, this.sliderMax]. First scale is reversed (0 is max) thus extract maxSlideValue
                module.audioNode.scaledValue = this.sliderMax - ((this.sliderMax - this.sliderMin) * (reducedPathPoints[i].y - this.sliderMin)) / 100;

                // move time with new value on time axis
                visualizer.timeValue.setAttribute("x", reducedPathPoints[i].x - 40);
                visualizer.timeValue.setAttribute("y", 115);
                visualizer.timeValue.innerHTML = `${(reducedPathPoints[i].x / 100).toFixed(2)}s`;
                visualizer.timeAxisValueLine.setAttribute("d", `M${reducedPathPoints[i].x},100 L${reducedPathPoints[i].x},115`);

                // move amp value on amp axis
                visualizer.ampAxisText.setAttribute("y", reducedPathPoints[i].y + 5); // 5 is half of font size
                visualizer.ampAxisValueLine.setAttribute("d", `M505,${reducedPathPoints[i].y} L490,${reducedPathPoints[i].y}`);
                // visualizer.ampValue.innerHTML = ;

                // update current value path
                const updatedPath = `${visualizer.currentPath.getAttribute("d")} L${reducedPathPoints[i].x},${reducedPathPoints[i].y},${reducedPathPoints[i].x},100`;
                visualizer.currentPath.setAttribute("d", updatedPath);

                // don't call promises if release time === 0 (it's a vertical-line-only-chart)
                if (timeBetweenPoints !== 0) await this.sleep(timeBetweenPoints);
            }

            this.loop && reducedPathPoints.length > 1 && this.updateConnectedSlider();
        },
        connect(destination) {
            // don't connect to input, only to parameters
            if (destination.parentID) {
                this.destination = modules[destination.parentID];
                this.parameterType = destination.parameterType;
                this.slider = modules[destination.parentID].content.controllers[destination.parameterType].slider;

                // disable slider
                this.slider.classList.add("disabled");

                // keep current slider value as the maximum value that envelope can reach
                if (this.slider.scaleLog) {
                    this.sliderMax = logPositionToValue(this.slider.value, this.slider.min, this.slider.max);
                } else {
                    this.sliderMax = this.slider.value;
                }

                this.sliderMin = parseFloat(this.slider.min);

                // allow loop to start
                this.loop = true;

                // start the show
                this.updateConnectedSlider();
            } else {
                //displayAlertOnElement("Please connect to the parameter instead of input", module.head, 3);
            }
        },
        disconnect() {
            // cancel the show
            this.loop = false;
            this.destination && window.cancelAnimationFrame(this.destination.animationID[this.parameterType]);
        },
    };

    module.isTransmitting = true;
    module.addInitalCable();
}
