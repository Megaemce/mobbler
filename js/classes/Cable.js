import Point from "../classes/Point.js";
import Line from "../classes/Line.js";
import { cables } from "../main.js";
import { whatDirection } from "../helpers/math.js";

let id = 0;

// Cable is made out of multiply points connected with lines
export default class Cable {
    constructor(module, destination) {
        this.source = module;
        this.destination = destination || undefined;
        this.animationID = undefined;
        this.type = undefined; // type of connection. Input or parameter type
        this.shape = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        this.jack = document.createElementNS("http://www.w3.org/2000/svg", "image");
        this.svg = document.getElementById("svgCanvas");
        this.lines = [];
        this.id = `cable-${++id}`;
        this.points = [new Point(0.378, 1.056, 0.4, true), new Point(2.695, 2.016, 0.4), new Point(4.831, 3.454, 0.4), new Point(6.789, 5.335, 0.4), new Point(8.575, 7.623, 0.4), new Point(10.192, 10.284, 0.4), new Point(11.646, 13.281, 0.4), new Point(14.078, 20.143, 0.4), new Point(15.909, 27.926, 0.4), new Point(17.173, 36.348, 0.4), new Point(17.906, 45.122, 0.4, true), new Point(18.142, 53.97, 0.4, true)]; // inital hanging shape:
        this.createCableObject(); // create cable linked with module
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
    get direction() {
        return whatDirection(this.points[0], this.points[11]);
    }
    makeActive() {
        this.shape.setAttribute("stroke", `url(#grad-${this.direction})`);
    }
    makeDeactive() {
        this.shape.setAttribute("stroke", "black");
    }
    createCableObject() {
        let xPosition = this.source.modulePosition.right;
        let yPosition = this.source.modulePosition.top + 10;
        let jackAnimationID = `${this.source.id}-jack-animation`;
        let shapeUnfoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        let jackRotateAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");

        this.jack.setAttribute("href", "./img/jack_cleared.svg");
        this.jack.setAttribute("height", "9");
        this.jack.setAttribute("y", "-4.5");
        this.jack.setAttribute("id", `${this.source.id}-jack`);
        this.jack.onmouseover = () => {
            this.svg.style.cursor = "grab";
        };
        this.jack.onmouseout = () => {
            if (this.svg.style.cursor === "grab") this.svg.style = "cursor: default";
        };

        // first dinggling (not connected) cable is an inital cable
        this.source.initalCable = this;

        // move original shape to the position on the right top of module
        this.points.forEach((point, i) => {
            point.move(xPosition, yPosition);
            if (i > 0) {
                // newLine keeps the array with pointers linked to Points which is cool!
                // by updating the line we update the points in the points array too
                let newLine = new Line(this.points[i - 1], this.points[i], Math.log(point.x), 0.8);
                this.lines.push(newLine);
            }
        });

        // translate points to actual svg shape (polyline)
        this.shape.setAttribute("stroke", "#040404");
        this.shape.setAttribute("fill", "none");
        this.shape.setAttribute("opacity", "0.9");
        this.shape.setAttribute("stroke-width", "2");
        this.shape.setAttribute("points", this.pointsToString);
        this.shape.setAttribute("stroke-dasharray", "60");

        this.svg.appendChild(this.shape);
        this.svg.appendChild(this.jack);

        // unfold cable from starting point
        shapeUnfoldAnimation.setAttribute("attributeName", "stroke-dashoffset");
        shapeUnfoldAnimation.setAttribute("from", "60");
        shapeUnfoldAnimation.setAttribute("to", "0");
        shapeUnfoldAnimation.setAttribute("dur", "1s");
        shapeUnfoldAnimation.setAttribute("fill", "freeze");

        this.shape.appendChild(shapeUnfoldAnimation);
        shapeUnfoldAnimation.beginElement();

        shapeUnfoldAnimation.onend = () => {
            this.shape.removeChild(shapeUnfoldAnimation);
        };

        // rotate jack from starting point so it looks like it's attached to the cable
        jackRotateAnimation.setAttribute(
            "path",
            `m ${0.378 + xPosition} ${1.056 + yPosition} 
            c 13.622 3.944 18.622 34.944 17.622 52.944`
        );
        jackRotateAnimation.setAttribute("begin", "0s");
        jackRotateAnimation.setAttribute("id", jackAnimationID);
        jackRotateAnimation.setAttribute("dur", "1s");
        jackRotateAnimation.setAttribute("rotate", "auto");
        jackRotateAnimation.setAttribute("fill", "freeze");

        this.jack.appendChild(jackRotateAnimation);
        jackRotateAnimation.beginElement();

        // stop acting like cable was moving. It was just stroke trick
        jackRotateAnimation.onend = () => {
            this.shape.removeAttribute("stroke-dasharray");
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
            let choosenElement = event.toElement;

            this.stopAnimation();

            // if we have good input (module or module's parameter - those two only have parentModule attribute)
            if (choosenElement.parentModule) {
                this.destination = choosenElement.parentModule;
                this.type = choosenElement.type;

                cables[this.id] = this;

                // different action for input and audio parameter
                if (choosenElement.type === "input") {
                    this.source.connectToModule(this.destination);
                } else {
                    this.source.connectToParameter(this.destination, choosenElement.type);
                }
            } else if (choosenElement.classList && choosenElement.classList.contains("destination-input")) {
                // final destination
                this.destination = choosenElement.parentNode; // parentNode is built-in attribute
                this.type = "input";
                this.source.connectToModule(this.destination);

                cables[this.id] = this;
            } else {
                // it's not final destination nor correct input thus cable has not been connected and can be fold
                // without worrying about other connections (no need to this.deleteCable())
                this.foldCable();
            }

            // make cable active if the source module is transmitting
            if (this.source.isTransmitting) this.makeActive();

            // cable connected or not it's not inital anymore
            this.source.initalCable = undefined;

            // only when shape is created enable removal
            this.shape.onclick = () => {
                this.deleteCable();
            };

            this.shape.onmouseover = () => {
                this.shape.style.cursor = "no-drop";
            };

            // clear document and svg
            this.svg.style.cursor = "default";
            document.onmousedown = undefined;
            document.onmousemove = undefined;
            document.onmouseup = undefined;

            this.source.addFirstCable();
        };
    }
    foldCable(duration) {
        if (!duration) duration = `0.5`;

        // remove jack and fold the cable back to inital position
        this.jack && this.jack.parentNode === this.svg && this.svg.removeChild(this.jack);

        let shapeFoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        shapeFoldAnimation.setAttribute("attributeName", "points");
        shapeFoldAnimation.setAttribute("from", this.pointsToString);
        shapeFoldAnimation.setAttribute("to", this.startPositionString);
        shapeFoldAnimation.setAttribute("dur", `${duration}s`);
        shapeFoldAnimation.setAttribute("fill", "freeze");

        this.shape.appendChild(shapeFoldAnimation);
        shapeFoldAnimation.beginElement();

        shapeFoldAnimation.onend = () => {
            this.svg.removeChild(this.shape);
        };
    }
}
