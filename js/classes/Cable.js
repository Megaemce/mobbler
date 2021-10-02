import Point from "../classes/Point.js";
import { cables } from "../main.js";
import { directionString } from "../helpers/math.js";
import { buildCable,displayAlertOnElement } from "../helpers/builders.js";

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
        };

        // when jack is clicked start cable moving function
        this.jack.onmousedown = (event) => {
            this.movingCable(event);
        };
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
    moveStartPoint(x, y) {
        this.points[0].move(x, y);
    }
    /* move cable.destination location  */
    moveEndPoint(x, y) {
        this.points[10].move(x, y);
        this.points[11].move(x, y);
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
        this.points[11].x = event.offsetX + 2.5;
        this.points[11].y = event.offsetY + 4.75;
        this.points[10].x = event.offsetX - 3;
        this.points[10].y = event.offsetY + 4.75;

        // in case just clicked and not moved, set x and y
        this.jack.removeAttribute("transform");
        this.jack.setAttribute("x", event.offsetX);
        this.jack.setAttribute("y", event.offsetY);

        this.startPhysicsAnimation();

        // moving cable around logic
        document.onmousemove = (event) => {
            let element = event.toElement;
            this.moveEndPoint(event.movementX, event.movementY);

            // if it's an input's image go up to the wrapper
            if (element.inputType && element.nodeName === "IMG") {
                element = element.parentNode
            }

            // if flying around the input try to dock Cooper
            if (element.inputType && element.inputType === "input") {
                let inputDockLocationX = element.getBoundingClientRect().x + 8;
                let inputDockLocationY = element.getBoundingClientRect().y + 9;

                this.points[11].x = inputDockLocationX + 2.5;
                this.points[11].y = inputDockLocationY + 4.75;
                this.points[10].x = inputDockLocationX - 3;
                this.points[10].y = inputDockLocationY + 4.75;

                this.jack.setAttribute("x", inputDockLocationX);
                this.jack.setAttribute("y", inputDockLocationY);
                //this.jack.style.opacity = "0";

            }
            // parameter input
            if (element.inputType && element.inputType !== "input") {
                let inputDockLocationX = element.getBoundingClientRect().x + 16.5;
                let inputDockLocationY = element.getBoundingClientRect().y + 20;

                this.points[11].x = inputDockLocationX - 0.5;
                this.points[11].y = inputDockLocationY + 4.75;
                this.points[10].x = inputDockLocationX;
                this.points[10].y = inputDockLocationY + 10.75;

                this.jack.setAttribute("x", inputDockLocationX);
                this.jack.setAttribute("y", inputDockLocationY);
                this.jack.style.opacity = "0";
            }
        };

        // stop moving cable - let's see where we are
        document.onmouseup = (event) => {
            let element = event.toElement;
            let duplicated = false; // checking if cable is not duplicated

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

            // only module's input got parameter "parentModule"
            if (element.parentModule) {
                // check if there is no connection like this added before
                Object.values(cables).forEach((cable) => {
                    if (cable.source === this.source) {
                        if (cable.destination === element.parentModule) {
                            if (cable.inputType === element.inputType) {
                                duplicated = true;
                            }
                        }
                    }
                });

                if (duplicated === false) {
                    cables[this.id] = this;
                    this.destination = element.parentModule;
                    this.inputType = element.inputType;
                } else {
                    displayAlertOnElement("Cable duplicated", element)
                }
            }
            // disabled option for self-loop
            if (this.destination && this.destination === this.source) {
                this.deleteCable();
            }
            // module-to-module connection
            if (this.destination && this.inputType === "input") {
                this.source.connectToModule(this.destination);
            }
            // module-to-parameter connection
            if (this.destination && this.inputType !== "input") {
                this.source.connectToParameter(this.destination, this.inputType);
            }
            // if this.destination was not populated till this point fold the cable
            if (!this.destination) {
                this.deleteCable();
            }

            // clear document and svg
            svg.style.cursor = "default";
            this.jack.onmousedown = undefined;
            document.onmousedown = undefined;
            document.onmousemove = undefined;
            document.onmouseup = undefined;
        };
    }
    /* start folding animation and remove shape from svg */
    foldCable(duration) {
        // fold the cable back to module's top right corner as remove it
        this.shape.appendChild(this.shape.foldAnimation);

        // set duration on shape fold animation if there is one provided
        duration && this.shape.foldAnimation.setAttribute("dur", `${duration}s`);
        this.shape.foldAnimation.setAttribute("from", this.pointsToString);
        this.shape.foldAnimation.setAttribute("to", this.startPositionString);
        this.shape.foldAnimation.beginElement();
        this.shape.foldAnimation.onend = () => {
            svg.removeChild(this.shape);
        };
    }
    /* remove cable from all related items. Check this.destination as initalCables get deleted too */
    deleteCable() {
        this.foldCable();

        // remove jack (if it's still exists)
        this.jack && svg.removeChild(this.jack);

        // disconnect source and destination
        //this.destination && this.source.audioNode && this.source.audioNode.disconnect(this.destination.audioNode);

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
