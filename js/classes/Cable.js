import Point from "../classes/Point.js";
import { cables } from "../main.js";
import { directionString } from "../helpers/math.js";
import { buildCable } from "../helpers/builders.js";

let id = 0;

// Cable is made out of multiply points connected with lines
export default class Cable {
    constructor(source, destination) {
        this.source = source;
        this.destination = destination || undefined;
        this.animationID = undefined;
        this.type = undefined; // type of connection. Input or parameter type
        this.shape = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        this.jack = document.createElementNS("http://www.w3.org/2000/svg", "image");
        this.lines = [];
        this.id = `cable-${++id}`;
        this.points = [new Point(0.378, 1.056, 0.4, true), new Point(2.695, 2.016, 0.4), new Point(4.831, 3.454, 0.4), new Point(6.789, 5.335, 0.4), new Point(8.575, 7.623, 0.4), new Point(10.192, 10.284, 0.4), new Point(11.646, 13.281, 0.4), new Point(14.078, 20.143, 0.4), new Point(15.909, 27.926, 0.4), new Point(17.173, 36.348, 0.4), new Point(17.906, 45.122, 0.4, true), new Point(18.142, 53.97, 0.4, true)]; // inital hanging shape:
        this.createCable(); // create cable HTML object
    }
    get svg() {
        return document.getElementById("svgCanvas");
    }
    get pointsToString() {
        let string = "";
        this.points.forEach((point) => {
            string += `${point.x},${point.y} `;
        });
        return string;
    }
    get startPositionString() {
        return `${this.points[0].x},${this.points[0].y} `.repeat(12);
    }
    makeActive() {
        let direction = directionString(this.points[0], this.points[11]);
        this.shape.setAttribute("stroke", `url(#grad-${direction})`);
    }
    makeDeactive() {
        this.shape.setAttribute("stroke", "black");
    }
    createCable() {
        buildCable(this);

        this.jack.onmouseover = () => {
            this.svg.style.cursor = "grab";
        };
        this.jack.onmouseout = () => {
            if (this.svg.style.cursor === "grab") this.svg.style = "cursor: default";
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
    stopAnimation() {
        setTimeout(() => {
            window.cancelAnimationFrame(this.animationID);
        }, 100);
    }
    moveStartPoint(x, y) {
        this.points[0].move(x, y);
    }
    moveEndPoint(x, y) {
        this.points[10].move(x, y);
        this.points[11].move(x, y);
    }
    deleteCable() {
        this.foldCable();

        delete cables[this.id];

        // unblock slider
        if (this.type !== "input") {
            this.destination.content.controllers[this.type].slider.classList.remove("disabled");
            window.cancelAnimationFrame(this.destination[this.type].animationID);
        }

        // reconnect all the others nodes
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
    movingCable(event) {
        this.svg.style = "cursor: url('./img/jack_cleared.svg'), auto;";

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
            this.source.addFirstCable();

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
            // something else thus fold the cable
            if (!element.parentModule && (!element.classList || !element.classList.contains("destination-input"))) {
                this.foldCable();
            }

            // clear document and svg
            this.svg.style.cursor = "default";
            document.onmousedown = undefined;
            document.onmousemove = undefined;
            document.onmouseup = undefined;
        };
    }
    foldCable(duration) {
        if (!duration) this.shape.foldAnimation.setAttribute("dur", `${duration}s`);

        console.log("folding cable with duration", duration);

        // remove jack and fold the cable back to inital position
        this.jack && this.jack.parentNode === this.svg && this.svg.removeChild(this.jack);

        this.shape.appendChild(this.shape.foldAnimation);
        this.shape.foldAnimation.beginElement();
        this.shape.foldAnimation.onend = () => {
            this.svg.removeChild(this.shape);
            delete cables[this.id];
        };
    }
}
