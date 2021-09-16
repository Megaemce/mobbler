import Point from "../classes/Point.js";
import { cables } from "../main.js";
import { directionString } from "../helpers/math.js";
import { buildCable } from "../helpers/builders.js";

let id = 0;
let svg = document.getElementById("svgCanvas");

// Cables are made out of lines that stretch between points
export default class Cable {
    constructor(source, destination) {
        this.source = source;
        this.destination = destination || undefined;
        this.animationID = undefined; // keep reference to the physics animation function
        this.type = undefined; // type of connection. Input or parameter type
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

        this.jack.onmouseover = () => {
            svg.style.cursor = "grab";
        };
        this.jack.onmouseout = () => {
            if (svg.style.cursor === "grab") svg.style = "cursor: default";
        };

        this.shape.appendChild(this.shape.unfoldAnimation);
        this.shape.unfoldAnimation.beginElement();
        this.shape.unfoldAnimation.onend = () => {
            this.shape.removeChild(this.shape.unfoldAnimation);
            this.shape.unfoldAnimation = undefined;
        };

        // stop acting like cable was moving. It was just stroke trick
        this.jack.appendChild(this.jack.rotateAnimation);
        this.jack.rotateAnimation.beginElement();
        this.jack.rotateAnimation.onend = () => {
            this.shape.removeAttribute("stroke-dasharray");
            this.jack.rotateAnimation = undefined;
        };

        // when jack is clicked start cable moving function
        this.jack.onmousedown = (event) => {
            this.jack.style.opacity = "0";
            this.movingCable(event);
        };
    }
    /* compute physics on cable  */
    startAnimation() {
        this.lines.forEach((line) => {
            line.gravity = true;
            line.update();
        });

        this.shape.setAttribute("points", this.pointsToString);

        this.animationID = requestAnimationFrame(() => {
            this.startAnimation();
        });
    }
    /* cancel physics computation */
    stopAnimation() {
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
    /* move cable.source location and update direction on active cable*/
    moveStartPoint(x, y) {
        this.points[0].move(x, y);
    }
    /* move cable.destination location  */
    moveEndPoint(x, y) {
        this.points[10].move(x, y);
        this.points[11].move(x, y);
    }
    /* all logic related to cable movement event */
    movingCable(event) {
        svg.style = "cursor: url('./img/jack_cleared.svg'), auto;";

        // two last points of the cable are set like this, so cable is in a middle of jack image
        this.points[11].x = event.offsetX + 2.5;
        this.points[11].y = event.offsetY + 4.75;
        this.points[10].x = event.offsetX - 3;
        this.points[10].y = event.offsetY + 4.75;

        this.startAnimation();

        document.onmousemove = (event) => {
            this.moveEndPoint(event.movementX, event.movementY);
        };

        // stop moving cable - let's see where we are
        document.onmouseup = (event) => {
            let element = event.toElement;

            this.stopAnimation();

            // remove inital cable and add new one
            this.source.initalCable = undefined;
            this.source.addInitalCable();

            // only when shape is created enable removal
            this.shape.onclick = () => {
                this.deleteCable();
            };

            this.shape.onmouseover = () => {
                this.shape.style.cursor = "no-drop";
            };

            // only module's inputs got parameter "parentModule"
            if (element.parentModule) {
                cables[this.id] = this;
                this.destination = element.parentModule;
                this.type = element.type;
            }
            // disabled option for self-loop
            if (this.destination && this.destination === this.source) {
                this.foldCable();
            }
            // module to input connection
            if (this.destination && this.type === "input") {
                this.source.connectToModule(this.destination);
            }
            // module to parameter connection
            if (this.destination && this.type !== "input") {
                this.source.connectToParameter(this.destination, this.type);
            }
            // module to final destination connection
            if (!this.destination && element.classList && element.classList.contains("destination-input")) {
                cables[this.id] = this; // needs to be before connectToModule as outcomingCables use cables array
                this.destination = element.parentNode; // parentNode is built-in attribute
                this.type = "input";
                this.source.connectToModule(this.destination);
            }
            // if this.destination was not populated till this point fold the cable
            if (!this.destination) {
                this.foldCable();
            }

            // clear document and svg
            svg.style.cursor = "default";
            document.onmousedown = undefined;
            document.onmousemove = undefined;
            document.onmouseup = undefined;
        };
    }
    /* start folding animation and remove shape from svg */
    foldCable(duration) {
        // set duration on shape fold animation if there is one provided
        !duration && this.shape.foldAnimation.setAttribute("dur", `${duration}s`);

        // remove jack
        this.jack && this.jack.parentNode === svg && svg.removeChild(this.jack);

        // fold the cable back to module's top right corner as remove it
        this.shape.appendChild(this.shape.foldAnimation);
        this.shape.foldAnimation.beginElement();
        this.shape.foldAnimation.onend = () => {
            svg.removeChild(this.shape);
        };
    }
    /* remove cable from all related items */
    deleteCable() {
        this.foldCable();

        // send further info that this cable is deactived
        if (this.destination.id !== "destination") {
            this.destination.markAllLinkedCablesAs("deactive");
        }

        // remove from cables dictionary (this needs to be after markAllLinkedCablesAs)
        delete cables[this.id];

        // unblock slider (if there is any connected)
        if (this.type !== "input") {
            this.destination.content.controllers[this.type].slider.classList.remove("disabled");
            window.cancelAnimationFrame(this.destination[this.type].animationID);
        }

        // reconnect all others nodes
        if (this.source.audioNode) {
            this.source.audioNode.disconnect();

            this.source.outcomingCables.forEach((cable) => {
                if (cable.type === "input") {
                    this.source.connectToModule(cable.destination);
                } else {
                    this.source.connectToParameter(cable.destination, cable.type);
                }
            });
        }
    }
}
