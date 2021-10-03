import Point from "../classes/Point.js";
import { cables } from "../main.js";
import { directionString } from "../helpers/math.js";
import { buildCable, displayAlertOnElement } from "../helpers/builders.js";

let id = 0;
let svg = document.getElementById("svgCanvas");

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
        buildCable(this);

        // start shape unfolding animation
        this.shape.appendChild(this.shape.unfoldAnimation);
        this.shape.unfoldAnimation.beginElement();
        this.shape.unfoldAnimation.onend = () => {
            this.shape.removeChild(this.shape.unfoldAnimation);
            this.shape.unfoldAnimation = undefined;
        };

        // start jack rotating animation
        this.jack.appendChild(this.jack.rotateAnimation);
        this.jack.rotateAnimation.beginElement();
        this.jack.rotateAnimation.onend = () => {
            this.shape.removeAttribute("stroke-dasharray");

            // remove animateMotion and rotate original jack to the final destination
            this.jack.removeChild(this.jack.rotateAnimation);
            this.jack.setAttribute("x", this.points[11].x);
            this.jack.setAttribute("y", this.points[11].y - 4.5); // jack.width/2 = 4.5
            this.jack.setAttribute("transform", `rotate(94,${this.points[11].x},${this.points[11].y})`);

            // add handler only when cable is fully transformed
            this.jack.style.cursor = "grab";

            // when jack is clicked start cable moving function
            this.jack.onmousedown = (event) => {
                this.movingCable(event);
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
        // default jack style is grab
        this.jack.style = undefined;
        svg.style.cursor = "grabbing";

        // two last points of the cable are set like this, so cable is in a middle of jack image
        this.points[11].moveTo(event.pageX + 2.5, event.pageY + 4.75);
        this.points[10].moveTo(event.pageX - 3, event.pageY + 4.75);

        // in case just clicked and not moved, set x and y
        this.jack.removeAttribute("transform");
        this.jack.setAttribute("x", event.pageX);
        this.jack.setAttribute("y", event.pageY);

        this.startPhysicsAnimation();

        // moving cable around logic
        document.onmousemove = (event) => {
            let element = event.toElement;

            // if it's an input's image go up to the wrapper
            if (element.inputType && element.nodeName === "IMG") {
                element = element.parentNode;
            }

            // if flying around the input try to dock Cooper
            if (element.inputType && element.inputType === "input") {
                let inputDockLocationX = element.getBoundingClientRect().x + 8;
                let inputDockLocationY = element.getBoundingClientRect().y + 9;

                this.points[11].moveTo(inputDockLocationX + 2.5, inputDockLocationY + 4.75);
                this.points[10].moveTo(inputDockLocationX - 3, inputDockLocationY + 4.75);

                this.jack.setAttribute("x", inputDockLocationX);
                this.jack.setAttribute("y", inputDockLocationY);
                this.jack.style.opacity = "0";
            }
            // parameter input
            if (element.inputType && element.inputType !== "input") {
                let inputDockLocationX = element.getBoundingClientRect().x + 16.5;
                let inputDockLocationY = element.getBoundingClientRect().y + 20;

                this.points[11].moveTo(inputDockLocationX - 0.5, inputDockLocationY + 4.75);
                this.points[10].moveTo(inputDockLocationX, inputDockLocationY + 10.75);

                this.jack.setAttribute("x", inputDockLocationX);
                this.jack.setAttribute("y", inputDockLocationY);
                this.jack.style.opacity = "0";
            }

            // something else thus return to regular shape (following the cursor)
            if (!element.inputType) {
                this.points[11].x = event.pageX + 2.5;
                this.points[11].y = event.pageY + 4.75;
                this.points[10].x = event.pageX - 3;
                this.points[10].y = event.pageY + 4.75;

                this.jack.setAttribute("x", event.pageX);
                this.jack.setAttribute("y", event.pageY);
                this.jack.style.opacity = "1";

                this.moveEndPointBy(event.movementX, event.movementY);
            }
        };

        // stop moving cable - let's see where we are
        document.onmouseup = (event) => {
            let element = event.toElement;

            this.stopPhysicsAnimation();

            // replace inital cable with a new one
            this.source.name !== "output" && this.source.addInitalCable();

            // only when shape is created enable removal
            this.shape.onclick = () => {
                this.deleteCable();
            };

            this.shape.onmouseover = () => {
                this.shape.style.cursor = "no-drop";
            };

            // if it's an input's image go up to the wrapper
            if (element.inputType && element.nodeName === "IMG") {
                element = element.parentNode;
            }

            // only module's input got parameter "parentModule"
            if (!element.parentModule) {
                displayAlertOnElement("Not connected", this.source.head);
                this.deleteCable();
            } // check if not duplicated
            else if (this.connectionUniqueness(element) === false) {
                displayAlertOnElement("Cable duplicated", element);
                this.deleteCable();
            } // disabled option for self-loop
            else if (element.parentModule === this.source) {
                displayAlertOnElement("Self-loop disabled", element);
                this.deleteCable();
            } else {
                // module-to-module connection
                if (element.inputType === "input") {
                    cables[this.id] = this;
                    this.destination = element.parentModule;
                    this.inputType = element.inputType;
                    this.source.connectToModule(this.destination);
                }
                // module-to-parameter connection
                if (element.inputType !== "input") {
                    // check if some other cable is connected to this parameter
                    let parameterOccupant = Object.values(cables).find((cable) => {
                        return cable.destination === element.parentModule && cable.inputType !== "input" && cable.inputType === element.inputType && cable.source !== this.source;
                    });

                    if (parameterOccupant) {
                        let typeWithCase = element.inputType.charAt(0).toUpperCase() + element.inputType.substr(1);
                        displayAlertOnElement("Only one input per parameter", element);
                        displayAlertOnElement(`${typeWithCase} parameter's occupant`, parameterOccupant.source.div);
                        this.deleteCable();
                    } else {
                        cables[this.id] = this;
                        this.destination = element.parentModule;
                        this.inputType = element.inputType;
                        this.source.connectToParameter(this.destination, this.inputType);
                    }
                }
            }

            // clear document and svg
            svg.style.cursor = "default";
            this.jack.onmousedown = undefined;
            document.onmousedown = undefined;
            document.onmousemove = undefined;
            document.onmouseup = undefined;
        };
    }
    /* remove cable from all related items. Check this.destination as initalCables get deleted too */
    deleteCable() {
        // fold the cable back to module's top right corner and remove it
        this.shape.appendChild(this.shape.foldAnimation);

        // set duration on shape fold animation if there is one provided
        this.shape.foldAnimation.setAttribute("dur", "0.5s");
        this.shape.foldAnimation.setAttribute("from", this.pointsToString);
        this.shape.foldAnimation.setAttribute("to", this.startPositionString);
        this.shape.foldAnimation.beginElement();
        this.shape.foldAnimation.onend = () => {
            svg.removeChild(this.shape);
        };

        // remove jack (if it's still exists)
        this.jack && svg.removeChild(this.jack);

        // disconnect source and destination
        // there is no way to check if source is really connected before disconnecting it thus apply ugly breakfix
        if (this.destination && this.source.audioNode) {
            this.source.audioNode.connect(this.destination.audioNode);
            this.source.audioNode.disconnect(this.destination.audioNode);
        }

        // send further info that this cable is deactived (if this is not an inital cable)
        if (this.destination && this.destination.name !== "output") {
            this.destination.markAllLinkedCablesAs("deactive");
        }

        // remove from cables dictionary (this needs to be after markAllLinkedCablesAs)
        delete cables[this.id];

        // if cable get removed directly markAllLinkedCablesAs will not unblock slider as there is no connection left
        if (this.destination && this.inputType !== "input") {
            this.destination.content.controllers[this.inputType].slider.classList.remove("disabled");
            this.destination.stopSliderAnimation(this.inputType);

            // un-busy'd input picture
            this.destination.footer[this.inputType].img.setAttribute("src", "./img/parameter_input.svg");
        }

        // un-busy'd input picture but only if there is no other things talking
        if (this.destination && this.inputType === "input" && this.destination.inputCount === 0) {
            this.destination.div.input.setAttribute("src", "./img/input.svg");
        }

        // reconnect all others nodes. If module got deleted don't try to reconnect its outcoming cables
        if (modules[this.source.id] && this.source.audioNode) {
            this.source.audioNode.disconnect();

            this.source.outcomingCables.forEach((cable) => {
                if (cable.inputType === "input") {
                    this.source.connectToModule(cable.destination);
                } else {
                    this.source.connectToParameter(cable.destination, cable.inputType);
                }
            });
        }
    }
}
