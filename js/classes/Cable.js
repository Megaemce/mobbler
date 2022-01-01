import Point from "../classes/Point.js";
import { cables, modules } from "../main.js";
import { directionString } from "../helpers/math.js";
import { buildCable, displayAlertOnElement } from "../helpers/builders.js";

const svg = document.getElementById("svgCanvas");
let id = 0;

// Cables are made out of lines that stretch between points
export default class Cable {
    constructor(sourceID, destinationID) {
        this.id = `cable-${++id}`; // used for cables dictionary
        this.jack = document.createElementNS("http://www.w3.org/2000/svg", "image");
        this.shape = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        this.lines = new Array();
        this.points = [new Point(0.378, 1.056, 0.4, true), new Point(2.695, 2.016, 0.4), new Point(4.831, 3.454, 0.4), new Point(6.789, 5.335, 0.4), new Point(8.575, 7.623, 0.4), new Point(10.192, 10.284, 0.4), new Point(11.646, 13.281, 0.4), new Point(14.078, 20.143, 0.4), new Point(15.909, 27.926, 0.4), new Point(17.173, 36.348, 0.4), new Point(17.906, 45.122, 0.4, true), new Point(18.142, 53.97, 0.4, true)]; // inital hanging shape
        this.sourceID = sourceID;
        this.inputName = undefined; // "input" for regular module-module connection or parameterType (eg. "Frequency")
        this.animationID = undefined; // keep reference to the physics animation function
        this.destinationID = destinationID;
        this.createCable(); // create cable HTML object
    }
    /* return points array as a flat string for cable.shape's points attribute  */
    get pointsToString() {
        let string = "";
        this.points.forEach((point) => {
            string += `${point.x},${point.y} `;
        });
        return string;
    }
    /* return cable.source right top corner position string for cable fold animation */
    get startPositionString() {
        return `${this.points[0].x},${this.points[0].y} `.repeat(12);
    }
    /* build cable html object and attach all logic/animation into it */
    createCable() {
        const cable = this;

        buildCable(cable);

        // start shape unfolding animation
        cable.shape.appendChild(cable.shape.unfoldAnimation);
        cable.shape.unfoldAnimation.beginElement();
        cable.shape.unfoldAnimation.onend = () => {
            cable.shape.removeChild(cable.shape.unfoldAnimation);
            cable.shape.unfoldAnimation = undefined;
        };

        // start jack rotating animation
        cable.jack.appendChild(cable.jack.rotateAnimation);
        cable.jack.rotateAnimation.beginElement();
        cable.jack.rotateAnimation.onend = () => {
            cable.shape.removeAttribute("stroke-dasharray");

            // remove animateMotion and rotate original jack to the final destination
            cable.jack.removeChild(cable.jack.rotateAnimation);
            cable.jack.setAttribute("x", cable.points[11].x);
            cable.jack.setAttribute("y", cable.points[11].y - 4.5); // jack.width/2 = 4.5
            cable.jack.setAttribute("transform", `rotate(94,${cable.points[11].x},${cable.points[11].y})`);

            // add handler only when cable is fully transformed
            cable.jack.style.cursor = "grab";

            // when jack is clicked start cable moving function
            cable.jack.onmousedown = (event) => {
                event.preventDefault(); // removing default Firefox drag/drop handler from SVG file
                cable.movingCable(event);
            };
        };
    }
    /* check if this cable is not duplicated with any other cable */
    connectionUniqueness(element) {
        let unique = true;
        Object.values(cables).forEach((cable) => {
            if (cable.sourceID === this.sourceID) {
                if (cable.destinationID === element.parentModuleID) {
                    if (cable.inputName === element.inputName) {
                        unique = false;
                    }
                }
            }
        });
        return unique;
    }
    /* compute physics on cable  */
    startPhysicsAnimation() {
        this.lines.forEach((line) => {
            line.gravity = true;
            line.update();
        });

        this.shape.setAttribute("points", this.pointsToString);

        this.animationID = requestAnimationFrame(() => {
            this.startPhysicsAnimation();
        });
    }
    /* cancel physics computation */
    stopPhysicsAnimation() {
        setTimeout(() => {
            window.cancelAnimationFrame(this.animationID);
        }, 200);
    }
    /* change cable.shape style so it has moving gradient animation */
    makeActive() {
        let direction = directionString(this.points[0], this.points[11]);
        this.shape.setAttribute("stroke", `url(#grad-${direction})`);
    }
    /* remove animated gradient so the cable looks inactive */
    makeDeactive() {
        this.shape.setAttribute("stroke", "black");
    }
    /* move cable.source location */
    moveStartPointBy(x, y) {
        this.points[0].moveBy(x, y);
    }
    /* move cable.destination location  */
    moveEndPointBy(x, y) {
        this.points[10].moveBy(x, y);
        this.points[11].moveBy(x, y);
        // move jack as well
        if (this.jack) {
            this.jack.setAttribute("x", parseFloat(this.jack.getAttribute("x")) + x);
            this.jack.setAttribute("y", parseFloat(this.jack.getAttribute("y")) + y);
        }
    }
    /* all logic related to cable movement event */
    movingCable(event) {
        const cable = this; // current cable
        // default jack style is grab
        cable.jack.style = undefined;

        svg.style.cursor = "grabbing";

        // two last points of the cable are set like this, so cable is in a middle of jack image
        cable.points[11].moveTo(event.pageX + 2.5, event.pageY + 4.75);
        cable.points[10].moveTo(event.pageX - 3, event.pageY + 4.75);

        // in case just clicked and not moved, set x and y
        cable.jack.removeAttribute("transform");
        cable.jack.setAttribute("x", event.pageX);
        cable.jack.setAttribute("y", event.pageY);

        cable.startPhysicsAnimation();

        // moving cable around logic
        document.onmousemove = (event) => {
            let target = event.target; // choosen HTML element

            // if it's an input's image go up to the wrapper
            if (target.inputName && target.nodeName === "IMG") {
                target = target.parentNode;
            }

            // if flying around the input try to dock Cooper
            if (target.inputName && target.inputName === "input") {
                const inputDockLocationX = parseFloat(target.getBoundingClientRect().x) + 8;
                const inputDockLocationY = parseFloat(target.getBoundingClientRect().y) + 9;

                cable.points[11].moveTo(inputDockLocationX + 2.5, inputDockLocationY + 4.75);
                cable.points[10].moveTo(inputDockLocationX - 3, inputDockLocationY + 4.75);

                cable.jack.setAttribute("x", inputDockLocationX);
                cable.jack.setAttribute("y", inputDockLocationY);
                cable.jack.style.opacity = "0";
            }
            // parameter input
            if (target.inputName && target.inputName !== "input") {
                const inputDockLocationX = parseFloat(target.getBoundingClientRect().x) + 16.5;
                const inputDockLocationY = parseFloat(target.getBoundingClientRect().y) + 20;

                cable.points[11].moveTo(inputDockLocationX - 0.5, inputDockLocationY + 4.75);
                cable.points[10].moveTo(inputDockLocationX, inputDockLocationY + 10.75);

                cable.jack.setAttribute("x", inputDockLocationX);
                cable.jack.setAttribute("y", inputDockLocationY);
                cable.jack.style.opacity = "0";
            }

            // something else thus return to regular shape (following the cursor)
            if (!target.inputName) {
                cable.points[11].x = event.pageX + 2.5;
                cable.points[11].y = event.pageY + 4.75;
                cable.points[10].x = event.pageX - 3;
                cable.points[10].y = event.pageY + 4.75;

                cable.jack.setAttribute("x", event.pageX);
                cable.jack.setAttribute("y", event.pageY);
                cable.jack.style.opacity = "1";

                cable.moveEndPointBy(event.movementX, event.movementY);
            }
        };

        // stop moving cable - let's see where we are
        document.onmouseup = (event) => {
            const source = modules[cable.sourceID]; // source module
            let target = event.target; // choosen HTML element

            cable.stopPhysicsAnimation();

            // replace inital cable with a new one
            source.addInitalCable();

            // add cursor - scissors to the cable
            cable.shape.classList.add("cable");

            // only when shape is created enable removal
            cable.shape.onclick = () => {
                cable.deleteCable();
            };

            // if it's an input's image go up to the wrapper
            if (target.inputName && target.nodeName === "IMG") {
                target = target.parentNode;
            }

            // only module's input got parameter "parentModuleID"
            if (!target.parentModuleID) {
                displayAlertOnElement("Not connected", source.head);
                cable.deleteCable();
            } // check if not duplicated
            else if (cable.connectionUniqueness(target) === false) {
                displayAlertOnElement("Cable duplicated", target);
                cable.deleteCable();
            } // disabled option for self-loop
            else if (target.parentModuleID === source.id) {
                displayAlertOnElement("Self-loop disabled", target);
                cable.deleteCable();
            } else {
                // module-to-module connection
                if (target.inputName === "input") {
                    cables[cable.id] = cable;
                    cable.destinationID = target.parentModuleID;
                    const cableDestination = modules[cable.destinationID];
                    cable.inputName = target.inputName;
                    source.connectToModule(cableDestination);
                }
                // module-to-parameter connection
                if (target.inputName !== "input") {
                    // check if any other cable is connected to this parameter. Returns cable
                    const parameterOccupant = Object.values(cables).find((cable) => {
                        return cable.destinationID === target.parentModuleID && cable.inputName !== "input" && cable.inputName === target.inputName && cable.sourceID !== source.id;
                    });

                    if (parameterOccupant) {
                        const typeWithCase = target.inputName.charAt(0).toUpperCase() + target.inputName.substr(1);
                        const sourceDiv = modules[parameterOccupant.sourceID].div;
                        displayAlertOnElement("Only one input per parameter", target);
                        displayAlertOnElement(`${typeWithCase} parameter's occupant`, sourceDiv);
                        cable.deleteCable();
                    } else {
                        cables[cable.id] = cable;
                        cable.destinationID = target.parentModuleID;
                        const cableDestination = modules[cable.destinationID];
                        cable.inputName = target.inputName;
                        source.isTransmitting && cable.makeActive();
                        source.connectToParameter(cableDestination, cable.inputName);
                    }
                }
            }

            // clear document and svg
            svg.style.cursor = "default";
            cable.jack.onmousedown = undefined;
            document.onmousedown = undefined;
            document.onmousemove = undefined;
            document.onmouseup = undefined;
        };
    }
    /* remove cable from all related items. Check this.destination as initalCables get deleted too */
    deleteCable() {
        const cable = this; // current cable
        const source = modules[this.sourceID]; // source module
        const destination = modules[this.destinationID];

        // fold the cable back to module's top right corner and remove it
        cable.shape.appendChild(cable.shape.foldAnimation);

        // set duration on shape fold animation if there is one provided
        cable.shape.foldAnimation.setAttribute("dur", "0.5s");
        cable.shape.foldAnimation.setAttribute("from", cable.pointsToString);
        cable.shape.foldAnimation.setAttribute("to", cable.startPositionString);
        cable.shape.foldAnimation.beginElement();
        cable.shape.foldAnimation.onend = () => {
            svg.removeChild(cable.shape);
        };

        // remove jack (if it's still exists)
        cable.jack && svg.removeChild(cable.jack);

        // remove from cables dictionary (this needs to be done before inputActivity)
        delete cables[cable.id];

        // if this is not an inital cable
        if (destination) {
            // action for cable connected to input
            if (cable.inputName === "input") {
                // if destination is no longer active mark it correctly (needs to be done after cable is deleted from "cables")
                if (destination.inputActivity === false) {
                    destination.isTransmitting = false;
                }

                // send further info that this cable is deactivated (needs to be done after destination.isTansmitting is set)
                destination.markAllLinkedCablesAs("deactive");

                // if cable was connecting module to analyser stop the animation there (but only if there is no other active connection)
                if (destination.constructor.name == "Visualizer" && !destination.inputActivity) {
                    destination.resetAnalyser();
                }

                // un-busy'd input picture but only if there is no other things talking
                if (destination.inputCount === 0) {
                    destination.div.input.setAttribute("src", "./img/input.svg");
                }

                // execute function if there is any hooked
                if (destination.onDisconnectInput) {
                    destination.onDisconnectInput(source);
                }
            }
            // action for cable connected to parameters
            if (cable.inputName !== "input") {
                // if cable get removed directly markAllLinkedCablesAs will not unblock slider as there is no connection left
                destination.content.controllers[cable.inputName].slider.classList.remove("disabled");
                destination.stopSliderAnimation(cable.inputName);

                // un-busy'd input picture
                destination.footer[cable.inputName].img.setAttribute("src", "./img/parameter_input.svg");

                // execute function if there is any hooked
                if (destination.onDisconnectParameter) {
                    destination.onDisconnectParameter(source);
                }
            }
            // reconnect all others nodes. If module got deleted don't try to reconnect its outcoming cables
            if (modules[source.id] && source.audioNode) {
                source.audioNode.disconnect();

                source.outcomingCables.forEach((cable) => {
                    const cableDestination = modules[cable.destinationID];
                    if (cable.inputName === "input") {
                        source.connectToModule(cableDestination);
                    } else {
                        source.connectToParameter(cableDestination, cable.inputName);
                    }
                });
            }
        }

        // remove object
        delete this;
    }
}
