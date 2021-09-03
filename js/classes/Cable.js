import Point from "../classes/Point.js";
import Line from "../classes/Line.js";

// Cable is made out of multiply points connected with lines
export default class Cable {
    constructor(module, destination) {
        this.source = module;
        this.destination = destination || null;
        this.animationID = undefined;
        this.jack = document.createElementNS("http://www.w3.org/2000/svg", "image");
        this.shape = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        this.svg = document.getElementById("svgCanvas");
        this.lines = [];
        this.points = [
            // inital hanging shape:
            new Point(0.378, 1.056, 0.4, true),
            new Point(2.695, 2.016, 0.4),
            new Point(4.831, 3.454, 0.4),
            new Point(6.789, 5.335, 0.4),
            new Point(8.575, 7.623, 0.4),
            new Point(10.192, 10.284, 0.4),
            new Point(11.646, 13.281, 0.4),
            new Point(14.078, 20.143, 0.4),
            new Point(15.909, 27.926, 0.4),
            new Point(17.173, 36.348, 0.4),
            new Point(17.906, 45.122, 0.4, true),
            new Point(18.142, 53.97, 0.4, true),
        ];
        this.createCableObject(); // create cable linked with module
        this.type = undefined; // type of connection. Input or parameter type
    }
    get pointsToString() {
        let string = "";
        this.points.forEach((point) => {
            string += `${point.x},${point.y} `;
        });
        return string;
    }
    get zeroPositionString() {
        return `${this.points[0].x},${this.points[0].y} `.repeat(12);
    }
    createCableObject() {
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

        let xPosition = this.source.html.getBoundingClientRect().right;
        let yPosition = this.source.html.getBoundingClientRect().top + 10;
        let jackAnimationID = `${this.source.id}-jack-animation`;
        let shapeUnfoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        let jackRotateAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");

        // first dinggling (not connected) cable needs to be keep in the outcoming to keep it
        // updated while just moving the module around
        this.source.initalCable = this;

        this.points.forEach((point, i) => {
            point.move(xPosition, yPosition);
            if (i > 0) {
                // newLine keeps the array with pointers linked to Points which is cool!
                // by updating the line we update the points in the points array too
                let newLine = new Line(this.points[i - 1], this.points[i], Math.log(point.x), 0.8);
                this.lines.push(newLine);
            }
        });

        this.shape.setAttribute("stroke", "#040404");
        this.shape.setAttribute("fill", "none");
        this.shape.setAttribute("stroke-width", "2");
        this.shape.setAttribute("points", this.pointsToString);
        this.shape.setAttribute("stroke-dasharray", "60");

        this.svg.appendChild(this.shape);
        this.svg.appendChild(this.jack);

        shapeUnfoldAnimation.setAttribute("attributeName", "stroke-dashoffset");
        shapeUnfoldAnimation.setAttribute("from", "60");
        shapeUnfoldAnimation.setAttribute("to", "0");
        shapeUnfoldAnimation.setAttribute("dur", "1s");
        shapeUnfoldAnimation.setAttribute("fill", "freeze");

        this.shape.appendChild(shapeUnfoldAnimation);
        shapeUnfoldAnimation.beginElement();

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

        jackRotateAnimation.onend = () => {
            this.shape.setAttribute("points", this.pointsToString);
            this.shape.removeAttribute("stroke-dasharray");
        };

        // when jack clicked start cable moving function
        this.jack.onmousedown = (event) => {
            this.movingCable(event);
        };
    }
    startAnimation() {
        this.shape.onmouseover = () => {
            this.shape.style.cursor = "no-drop";
        };

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

        // go to the neighboors and check if there are pointing back to the same direction as cable
        // if yes, remove it from the incomingCables list
        // checking destination in case of initalCable removal
        if (this.destination && this.destination.incomingCables) {
            this.destination.incomingCables.slice(0).forEach((cable, index) => {
                if (cable.source === this.source) {
                    this.destination.incomingCables.splice(index, 1);
                }
            });
        }

        // remove it from the outcomingCables list
        if (this.source.outcomingCables) {
            this.source.outcomingCables.slice(0).forEach((cable, index) => {
                if (cable.destination === this.destination) {
                    this.source.outcomingCables.splice(index, 1);
                }
            });
        }

        // reconnect all the others nodes
        if (this.source.audioNode) {
            this.source.audioNode.disconnect();

            if (this.source.outcomingCables) {
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
    movingCable(event) {
        this.svg.style = "cursor: url('./img/jack_cleared.svg'), auto;";

        this.svg.removeChild(this.jack);
        this.jack = undefined;

        // two last points of the cable are set like this, so cable is in a middle of jack image
        this.points[11].x = event.offsetX + 2.5;
        this.points[11].y = event.offsetY + 4.75;
        this.points[10].x = event.offsetX - 3;
        this.points[10].y = event.offsetY + 4.75;

        this.startAnimation();

        document.onmousemove = (event) => {
            this.points[11].x = event.clientX + 2.5;
            this.points[11].y = event.clientY + 4.75;
            this.points[10].x = event.clientX - 3;
            this.points[10].y = event.clientY + 4.75;
        };

        // stop moving cable - let's see where we are
        document.onmouseup = (event) => {
            let choosenElement = event.toElement;

            this.stopAnimation();

            // if we have good input (module or module's parameter)
            if (choosenElement.classList && choosenElement.parentModule) {
                this.destination = choosenElement.parentModule; // parentModule is set on input and audio parameters only
                this.source.outcomingCables.push(this);
                this.destination.incomingCables.push(this);
                this.type = choosenElement.type;

                // different action for input and audio parameter
                if (choosenElement.type === "input") {
                    this.source.connectToModule(this.destination);
                }
                // in parameters .type is an audio node property name without spaces
                else {
                    this.source.connectToParameter(this.destination, choosenElement.type);
                }

                // only when shape is created enable removal
                this.shape.onclick = () => {
                    this.deleteCable();
                };
            } else if (choosenElement.classList && choosenElement.classList.contains("destination-input")) {
                // final destination, built-in attribute, 'this.destination.incomingCables' is undefined
                this.destination = choosenElement.parentNode;
                this.source.outcomingCables.push(this);
                this.source.connectToModule(this.destination);
            } else {
                // it's not final destination nor correct input thus cable has not been connected and can be fold
                // without working about other connections (no need to this.deleteCable())
                this.foldCable();
            }

            // cable connected or not it's not inital anymore
            this.source.initalCable = undefined;

            this.svg.style.cursor = "default";
            document.onmousedown = undefined;
            document.onmousemove = undefined;
            document.onmouseup = undefined;

            this.source.addFirstCable(); // when cable is dropped create new one
        };
    }
    foldCable(duration) {
        if (!duration) duration = `0.5`;

        // remove jack and fold the cable back to inital position
        this.jack && this.svg.removeChild(this.jack);

        let shapeFoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        shapeFoldAnimation.setAttribute("attributeName", "points");
        shapeFoldAnimation.setAttribute("from", this.pointsToString);
        shapeFoldAnimation.setAttribute("to", this.zeroPositionString);
        shapeFoldAnimation.setAttribute("dur", `${duration}s`);
        shapeFoldAnimation.setAttribute("fill", "freeze");

        this.shape.appendChild(shapeFoldAnimation);
        shapeFoldAnimation.beginElement();

        shapeFoldAnimation.onend = () => {
            this.svg.removeChild(this.shape);
        };
    }
}
