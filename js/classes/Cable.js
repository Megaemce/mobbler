import Point from "../classes/Point.js";
import { cables } from "../main.js";
import { directionString } from "../helpers/math.js";
import { buildCable, displayAlertOnElement } from "../helpers/builders.js";

const svg = document.getElementById("svgCanvas");
let id = 0;

// Cables are made out of lines that stretch between points
export default class Cable {
    constructor(source, destination) {
        this.source = source;
        this.destination = destination || undefined;
        this.animationID = undefined; // keep reference to the physics animation function
        this.inputType = undefined; // type of connection. Input or parameter type
        this.shape = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        this.jack = document.createElementNS("http://www.w3.org/2000/svg", "image");
        this.lines = [];
        this.id = `cable-${++id}`; // used for cables dictionary
        this.points = [new Point(0.378, 1.056, 0.4, true), new Point(2.695, 2.016, 0.4), new Point(4.831, 3.454, 0.4), new Point(6.789, 5.335, 0.4), new Point(8.575, 7.623, 0.4), new Point(10.192, 10.284, 0.4), new Point(11.646, 13.281, 0.4), new Point(14.078, 20.143, 0.4), new Point(15.909, 27.926, 0.4), new Point(17.173, 36.348, 0.4), new Point(17.906, 45.122, 0.4, true), new Point(18.142, 53.97, 0.4, true)]; // inital hanging shape:
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
            if (cable.source === this.source) {
                if (cable.destination === element.parentModule) {
                    if (cable.inputType === element.inputType) {
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
        }, 100);
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
            this.jack.setAttribute("x", parseInt(this.jack.getAttribute("x")) + x);
            this.jack.setAttribute("y", parseInt(this.jack.getAttribute("y")) + y);
        }
    }
    /* all logic related to cable movement event */
    movingCable(event) {
        const cable = this;
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
            let target = event.target;

            // if it's an input's image go up to the wrapper
            if (target.inputType && target.nodeName === "IMG") {
                target = target.parentNode;
            }

            // if flying around the input try to dock Cooper
            if (target.inputType && target.inputType === "input") {
                const inputDockLocationX = target.getBoundingClientRect().x + 8;
                const inputDockLocationY = target.getBoundingClientRect().y + 9;

                cable.points[11].moveTo(inputDockLocationX + 2.5, inputDockLocationY + 4.75);
                cable.points[10].moveTo(inputDockLocationX - 3, inputDockLocationY + 4.75);

                cable.jack.setAttribute("x", inputDockLocationX);
                cable.jack.setAttribute("y", inputDockLocationY);
                cable.jack.style.opacity = "0";
            }
            // parameter input
            if (target.inputType && target.inputType !== "input") {
                const inputDockLocationX = target.getBoundingClientRect().x + 16.5;
                const inputDockLocationY = target.getBoundingClientRect().y + 20;

                cable.points[11].moveTo(inputDockLocationX - 0.5, inputDockLocationY + 4.75);
                cable.points[10].moveTo(inputDockLocationX, inputDockLocationY + 10.75);

                cable.jack.setAttribute("x", inputDockLocationX);
                cable.jack.setAttribute("y", inputDockLocationY);
                cable.jack.style.opacity = "0";
            }

            // something else thus return to regular shape (following the cursor)
            if (!target.inputType) {
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
            const source = cable.source;
            let target = event.target;

            cable.stopPhysicsAnimation();

            // replace inital cable with a new one
            source.name !== "output" && source.addInitalCable();

            // only when shape is created enable removal
            cable.shape.onclick = () => {
                cable.deleteCable();
            };

            cable.shape.onmouseover = () => {
                cable.shape.style.cursor = "no-drop";
            };

            // if it's an input's image go up to the wrapper
            if (target.inputType && target.nodeName === "IMG") {
                target = target.parentNode;
            }

            // only module's input got parameter "parentModule"
            if (!target.parentModule) {
                displayAlertOnElement("Not connected", source.head);
                cable.deleteCable();
            } // check if not duplicated
            else if (cable.connectionUniqueness(target) === false) {
                displayAlertOnElement("Cable duplicated", target);
                cable.deleteCable();
            } // disabled option for self-loop
            else if (target.parentModule === source) {
                displayAlertOnElement("Self-loop disabled", target);
                cable.deleteCable();
            } else {
                // module-to-module connection
                if (target.inputType === "input") {
                    cables[cable.id] = cable;
                    cable.destination = target.parentModule;
                    cable.inputType = target.inputType;
                    source.connectToModule(cable.destination);
                }
                // module-to-parameter connection
                if (target.inputType !== "input") {
                    // check if some other cable is connected to this parameter
                    let parameterOccupant = Object.values(cables).find((cable) => {
                        return cable.destination === target.parentModule && cable.inputType !== "input" && cable.inputType === target.inputType && cable.source !== source;
                    });

                    if (parameterOccupant) {
                        let typeWithCase = target.inputType.charAt(0).toUpperCase() + target.inputType.substr(1);
                        displayAlertOnElement("Only one input per parameter", target);
                        displayAlertOnElement(`${typeWithCase} parameter's occupant`, parameterOccupant.source.div);
                        cable.deleteCable();
                    } else {
                        cables[cable.id] = cable;
                        cable.destination = target.parentModule;
                        cable.inputType = target.inputType;
                        source.isTransmitting && cable.makeActive();
                        source.connectToParameter(cable.destination, cable.inputType);
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
        const cable = this;
        const source = this.source;
        const destination = this.destination;

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

        // disconnect source and destination (if this is a module-module connection)
        if (destination && source.audioNode && cable.inputType === "input") {
            try {
                // multiNode supports disconnect but can't return proper value on module.disconnect(<multiNode>)
                destination.audioNode.inputNode && source.audioNode.disconnect(destination.audioNode.inputNode);
                !destination.audioNode.inputNode && source.audioNode.disconnect(destination.audioNode);
            } catch (error) {
                console.log(`Cannot disconnect ${source.name} and ${destination.name} as they are not connected anymore`);
            }
        }

        // send further info that this cable is deactived (if this is not an inital cable)
        if (destination && destination.name !== "output") {
            destination.markAllLinkedCablesAs("deactive");
        }

        // remove from cables dictionary (this needs to be after markAllLinkedCablesAs)
        delete cables[cable.id];

        // if cable get removed directly markAllLinkedCablesAs will not unblock slider as there is no connection left
        if (destination && cable.inputType !== "input") {
            destination.content.controllers[cable.inputType].slider.classList.remove("disabled");
            destination.stopSliderAnimation(cable.inputType);

            // un-busy'd input picture
            destination.footer[cable.inputType].img.setAttribute("src", "./img/parameter_input.svg");
        }

        // un-busy'd input picture but only if there is no other things talking
        if (destination && cable.inputType === "input" && destination.inputCount === 0) {
            destination.div.input.setAttribute("src", "./img/input.svg");
        }

        // reconnect all others nodes. If module got deleted don't try to reconnect its outcoming cables
        if (modules[source.id] && source.audioNode) {
            source.audioNode.disconnect();

            source.outcomingCables.forEach((cable) => {
                if (cable.inputType === "input") {
                    source.connectToModule(cable.destination);
                } else {
                    source.connectToParameter(cable.destination, cable.inputType);
                }
            });
        }
    }
}
