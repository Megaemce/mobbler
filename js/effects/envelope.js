import Module from "../classes/Module.js";
import Parameter from "../classes/Parameter.js";
import { displayAlertOnElement, buildEnvelope } from "../helpers/builders.js";
import { modules, cables } from "../main.js";

export default function enveloper(event, initalDelay, initalAttack, initalHold, initalDecay, initalSustain, initalRelease) {
    const hold = parseFloat(initalHold || 75);
    const delay = parseFloat(initalDelay || 0);
    const decay = parseFloat(initalDecay || 85);
    const attack = parseFloat(initalAttack || 40);
    const sustain = parseFloat(initalSustain || 20);
    const release = parseFloat(initalRelease || 55);
    const holdInfo = "Number of second by which max sound will be played";
    const delayInfo = "Number of second by which envelope start will be delayed";
    const decayInfo = "Time taken for the subsequent run down from the attack level to the designated sustain level";
    const attackInfo = "Time taken for initial run-up of level from nil to peak, beginning when the key is pressed";
    const sustainInfo = "Level during the main sequence of the sound's duration, until the key is released";
    const releaseInfo = "Time taken for the level to decay from the sustain level to zero after the key is released";
    let pointDelay = delay;
    let pointAttack = pointDelay + attack;
    let pointDecay = pointAttack + decay;
    let pointSustain = 100 - sustain;
    let pointHold = pointDecay + hold;
    let pointRelease = pointHold + release;

    const module = new Module("Envelope", false);

    const visualizer = buildEnvelope(module, pointDelay, pointAttack, pointDecay, pointSustain, pointHold, pointRelease);
    visualizer.path.setAttribute("d", `M0,100 L${pointDelay},100,${pointAttack},0,${pointDecay},${pointSustain},${pointHold},${pointSustain},${pointRelease},100`);

    module.createSlider("delay", delay, 0, 100, 1, "sec", false, delayInfo);
    module.createSlider("attack", attack, 0, 100, 1, "sec", false, attackInfo);
    module.createSlider("decay", decay, 0, 100, 1, "sec", false, decayInfo);
    module.createSlider("sustain", sustain, 0, 100, 1, "", false, sustainInfo);
    module.createSlider("hold", hold, 0, 100, 1, "sec", false, holdInfo);
    module.createSlider("release", release, 0, 100, 1, "sec", false, releaseInfo);

    // reverse slider order. Update path after all other values are updated too
    // functions used when specific parameter is changed
    function releaseSetFunction() {
        pointRelease = pointHold + module.audioNode.release.value;
        visualizer.release.setAttribute("cx", pointRelease);
        visualizer.path.setAttribute("d", `M0,100 L${pointDelay},100,${pointAttack},0,${pointDecay},${pointSustain},${pointHold},${pointSustain},${pointRelease},100`);
    }
    function holdSetFunction() {
        pointHold = pointDecay + module.audioNode.hold.value;
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
        pointDecay = pointAttack + module.audioNode.decay.value;
        visualizer.decay.setAttribute("cx", pointDecay);
        sustainSetFunction();
    }
    function attackSetFunction() {
        pointAttack = pointDelay + module.audioNode.attack.value;
        visualizer.attack.setAttribute("cx", pointAttack);
        decaySetFunction();
    }
    function delaySetFunction() {
        pointDelay = module.audioNode.delay.value;
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
        async timeout(ms) {
            // slow down "for" loop to update slider according to envelope time
            return new Promise((handler) => setTimeout(handler, ms));
        },
        async updateSlider() {
            const pathLength = visualizer.path.getTotalLength().toFixed(0);
            const envelopeTime = parseFloat(visualizer.release.attributes.cx.value) / 100; // num of sec

            // collect pathLength points (not too much not to small)
            let pathPoints = [];
            for (let i = 0; i <= pathLength; i++) {
                const point = {};
                point.x = visualizer.path.getPointAtLength(i).x.toFixed(2);
                point.y = visualizer.path.getPointAtLength(i).y.toFixed(2);
                pathPoints.push(point);
            }

            // reduce array to element that don't lay on the straight vertical line (calling too many promises is slow)
            let reducedPathPoints = [pathPoints[0]];
            for (let i = 1; i < pathPoints.length; i++) {
                if (pathPoints[i - 1].x !== pathPoints[i].x && Math.abs(pathPoints[i - 1].y - pathPoints[i].y) !== 1) {
                    reducedPathPoints.push(pathPoints[i - 1]);
                }
            }

            // time between for loop iteration in miliseconds
            const timePerFrame = (envelopeTime / pathLength) * 1000; // ms per frame

            for (let i = 0; i < reducedPathPoints.length; i++) {
                // scale value from [0,100] to [0, this.maxSliderValue]. First scale is reversed (0 is max) thus extract maxSlideValue
                const scaledValue = this.maxSliderValue - (this.maxSliderValue * reducedPathPoints[i].y) / 100;

                // update slider and audioNode
                this.slider.value = scaledValue;
                if (this.destination.audioNode) this.destination.audioNode[this.parameterType].value = scaledValue;

                // don't call promises if release time === 0 (it's a vertical-line-only-chart)
                if (timePerFrame !== 0) await this.timeout(timePerFrame);

                // loop everything up
                if (i === reducedPathPoints.length - 1 && this.loop) {
                    this.updateSlider();
                }
            }
        },
        connect(destination) {
            // don't connect to input, only to parameters
            if (destination.parentID) {
                this.destination = modules[destination.parentID];
                this.parameterType = destination.parameterType;
                this.slider = modules[destination.parentID].content.controllers[destination.parameterType].slider;

                // disable slider
                this.slider.classList.add("disabled");
                this.maxSliderValue = parseFloat(this.slider.value);

                // allow loop to start
                this.loop = true;

                // start the show
                this.updateSlider();
            } else {
                displayAlertOnElement("Please connect to the parameter instead of input", module.head, 3);
            }
        },
        disconnect() {
            // cancel the show
            this.loop = false;
        },
    };

    module.audioNode.isTransmitting = true;
    module.addInitalCable();
}
