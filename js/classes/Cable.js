import Point from "../classes/Point.js";
import Line from "../classes/Line.js";

// Cable is made out of multiply points connected with lines
export default class Cable {
    constructor(module, destination) {
        this.source = module;
        this.destination = destination || null;
        this.jack = document.createElementNS("http://www.w3.org/2000/svg", "image");
        this.shape = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        this.animationID = undefined;
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
        this.createCable(); // create cable linked with module
    }
    // update
    startAnimation() {
        let pointsString = "";

        this.shape.onmouseover = () => {
            this.shape.style.cursor = "no-drop";
        };

        this.lines.forEach((line) => {
            line.gravity = true;
            line.update();
        });

        this.points.forEach((point) => {
            pointsString += `${point.x},${point.y} `;
        });

        this.shape.setAttribute("points", pointsString);

        this.animationID = requestAnimationFrame(() => {
            this.startAnimation();
        });
    }
    cancelAnimation() {
        setTimeout(() => {
            window.cancelAnimationFrame(this.animationID);
        }, 100);
    }
    createCable() {
        let svg = document.getElementById("svgCanvas");
        let jack = this.jack;
        let shape = this.shape;

        jack.setAttribute("href", "./img/jack_cleared.svg");
        jack.setAttribute("height", "9");
        jack.setAttribute("y", "-4.5");
        jack.setAttribute("id", `${this.source.id}-jack`);

        jack.onmouseover = () => {
            svg.style.cursor = "grab";
        };
        jack.onmouseout = () => {
            if (svg.style.cursor === "grab") svg.style = "cursor: default";
        };

        let lines = [];
        let count = 12;
        let pointsString = "";
        let initalPosition = "";
        let xPosition = this.source.html.getBoundingClientRect().right;
        let yPosition = this.source.html.getBoundingClientRect().top + 10;
        let jackAnimationID = `${this.source.id}-jack-animation`;
        let destinationInput = document.getElementById("destination-input");
        let shapeUnfoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        let shapeFoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        let jackRotateAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
        let points = this.points;

        // first dinggling (not connected) cable needs to be keep in the outcoming to keep it
        // updated while just moving the module around
        if (!this.source.outcomingCables) this.source.outcomingCables = new Array();
        this.source.outcomingCables.push(this); // this is the active Cable

        svg.appendChild(shape);
        svg.appendChild(jack);

        this.points.forEach((point, i) => {
            point.move(xPosition, yPosition);
            if (i > 0) {
                // newLine keeps the array with pointers linked to Points which is cool!
                // by updating the line we update the points in the points array too
                let newLine = new Line(this.points[i - 1], this.points[i], Math.log(point.x), 0.8);
                this.lines.push(newLine);
            }
            pointsString += `${point.x},${point.y} `;
            initalPosition += `${this.points[0].x},${this.points[0].y} `;
        });

        shape.setAttribute("stroke", "#040404");
        shape.setAttribute("fill", "none");
        shape.setAttribute("stroke-width", "2");
        shape.setAttribute("points", pointsString);
        shape.setAttribute("stroke-dasharray", "60");

        shapeUnfoldAnimation.setAttribute("attributeName", "stroke-dashoffset");
        shapeUnfoldAnimation.setAttribute("from", "60");
        shapeUnfoldAnimation.setAttribute("to", "0");
        shapeUnfoldAnimation.setAttribute("dur", "1s");
        shapeUnfoldAnimation.setAttribute("fill", "freeze");

        shape.appendChild(shapeUnfoldAnimation);
        shapeUnfoldAnimation.beginElement();

        // remove old animation. This can't be done differently as I hate svg translate
        document.getElementById(jackAnimationID) && jack.removeChild(document.getElementById(jackAnimationID));

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

        jack.appendChild(jackRotateAnimation);
        jackRotateAnimation.beginElement();

        jackRotateAnimation.onend = () => {
            shape.setAttribute("points", pointsString);
            shape.removeAttribute("stroke-dasharray");
        };

        // moving cable part - maybe worth moving to separate method
        jack.onmousedown = (event) => {
            jack.style.opacity = "0";

            svg.style = "cursor: url('./img/jack_cleared.svg'), auto;";

            // values set like this so it looks cool
            // update last two points of the cable
            this.points[count - 1].x = event.offsetX + 2.5;
            this.points[count - 1].y = event.offsetY + 4.75;
            this.points[count - 2].x = event.offsetX - 3;
            this.points[count - 2].y = event.offsetY + 4.75;

            this.startAnimation();

            document.onmousemove = (event) => {
                this.points[count - 1].x = event.clientX + 2.5;
                this.points[count - 1].y = event.clientY + 4.75;
                this.points[count - 2].x = event.clientX - 3;
                this.points[count - 2].y = event.clientY + 4.75;
            };

            // we ended moving around with cable
            document.onmouseup = (event) => {
                this.cancelAnimation();

                // only when shape is created enable removal
                shape.onclick = () => {
                    svg.removeChild(shape);
                };

                svg.style.cursor = "default";
                document.onmousedown = undefined;
                document.onmousemove = undefined;
                document.onmouseup = undefined;

                // unhide jack
                jack.style.opacity = "1";

                this.stopMovingCable(event);

                // shapeFoldAnimation.setAttribute("attributeName", "points");
                // shapeFoldAnimation.setAttribute("from", pointsString);
                // shapeFoldAnimation.setAttribute("to", initalPosition);
                // shapeFoldAnimation.setAttribute("dur", "0.5s");
                // shapeFoldAnimation.setAttribute("fill", "freeze");

                // shape.appendChild(shapeFoldAnimation);
                // shapeFoldAnimation.beginElement();

                // shapeFoldAnimation.onend = () => {
                //     svg.removeChild(shape);
                // };

                // when cable is dropped create new one
                //this.createCable();
            };
        };
    }
    updateStartPoint(x, y) {
        this.points[0].x = x;
        this.points[0].y = y;
    }
    updateEndPoint(x, y) {
        this.points[10].x = x;
        this.points[10].y = y;
        this.points[11].x = x;
        this.points[11].y = y;
    }
    deleteCable() {
        this.shape.parentNode && this.shape.parentNode.removeChild(this.shape);

        // go to the neighboors and check if there are pointing back to the same direction as cable
        // if yes, remove it from the incomingCables list
        // checking destination in case of activeCable removal
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
                    this.source.audioNode.connect(cable.destination.audioNode);
                });
            }
        }
    }
    stopMovingCable(event) {
        let choosenElement = event.toElement;
        let destinationModule = undefined; // Module type
        let sourceModule = this.source; // also Module type

        if (choosenElement.classList && choosenElement.parentModule) {
            destinationModule = choosenElement.parentModule; // parentModule is set on input and audio parameters only
        } else if (choosenElement.classList && choosenElement.classList.contains("destination-input")) {
            // final destination, built-in attribute
            this.destination = destinationModule = choosenElement.parentNode;
        } else {
            sourceModule.outcomingCables.pop(); // CABLE SHOULD BE REMOVED FROM OUTCOMING CABLES ARRAY
            return false; // something else thus kill it with fire
        }

        // Put an entry into the sourceModule's outputs
        if (!sourceModule.outcomingCables) sourceModule.outcomingCables = new Array();

        sourceModule.outcomingCables.push(this); // this is the active Cable

        // Put an entry into the destinations's inputs
        if (!destinationModule.incomingCables) destinationModule.incomingCables = new Array();

        destinationModule.incomingCables.push(this);

        // different action for input and audio parameter
        if (choosenElement.type === "input") {
            sourceModule.connectToModule(destinationModule);
            this.destination = destinationModule;
        }
        // type === audio node property name without spaces
        else sourceModule.connectToParameter(destinationModule, choosenElement.type);
    }
}
