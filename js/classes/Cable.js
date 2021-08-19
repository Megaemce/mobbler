import Point from "../classes/Point.js";
import Line from "../classes/Line.js";
import connectModules from "../logic/connectModules.js";
import connectParameter from "../logic/connectParameter.js";

// Cable is made out of multiply points connected with lines
export default class Cable {
    constructor(module, destination) {
        this.module = module;
        this.source = module.id;
        this.destination = destination || null;
        this.jack = document.createElementNS("http://www.w3.org/2000/svg", "image");
        this.svg = document.getElementById("svgCanvas");

        this.jack.setAttribute("href", "./img/jack_cleared.svg");
        this.jack.setAttribute("height", "9");
        this.jack.setAttribute("y", "-4.5");
        this.jack.setAttribute("id", `${module.id}-jack`);

        this.jack.onmouseover = () => {
            this.svg.style.cursor = "grab";
        };
        this.jack.onmouseout = () => {
            if (this.svg.style.cursor === "grab") this.svg.style = "cursor: default";
        };

        this.createCable();
    }
    createCable() {
        let lines = [];
        let count = 12;
        let pointsString = "";
        let jack = this.jack;
        let svg = this.svg;
        let initalPosition = "";
        let animationID = undefined;
        let xPosition = this.module.getBoundingClientRect().right;
        let yPosition = this.module.getBoundingClientRect().top + 10;
        let jackAnimationID = `${this.jack.id}-animation`;
        let destinationInput = document.getElementById("destination-input");
        let shape = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        let shapeUnfoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        let shapeFoldAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        let jackRotateAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
        let points = [
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

        svg.appendChild(shape);
        svg.appendChild(jack);

        points.forEach((point, i) => {
            point.move(xPosition, yPosition);
            if (i > 0) {
                let newLine = new Line(points[i - 1], points[i], Math.log(point.x), 0.8);
                lines.push(newLine);
            }
            pointsString += `${point.x},${point.y} `;
            initalPosition += `${points[0].x},${points[0].y} `;
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

        let calculatePhysics = () => {
            pointsString = "";

            shape.onmouseover = () => {
                shape.style.cursor = "no-drop";
            };

            lines.forEach((line) => {
                line.update();
            });

            points.forEach((point) => {
                pointsString += `${point.x},${point.y} `;
            });

            shape.setAttribute("points", pointsString);

            animationID = window.requestAnimationFrame(calculatePhysics);
        };

        // moving cable part - maybe worth moving to separate method
        jack.onmousedown = (event) => {
            jack.style.opacity = "0";

            svg.style = "cursor: url('./img/jack_cleared.svg'), auto;";

            // values set like this so it looks cool
            points[count - 1].x = event.offsetX + 2.5;
            points[count - 1].y = event.offsetY + 4.75;
            points[count - 2].x = event.offsetX - 3;
            points[count - 2].y = event.offsetY + 4.75;

            lines.forEach((line) => {
                line.gravity = true;
            });

            calculatePhysics();

            svg.onmousemove = (event) => {
                points[count - 1].x = event.offsetX + 2.5;
                points[count - 1].y = event.offsetY + 4.75;
                points[count - 2].x = event.offsetX - 3;
                points[count - 2].y = event.offsetY + 4.75;
            };

            svg.onmouseup = () => {
                // give some time for a physic calculation to finish
                setTimeout(() => {
                    window.cancelAnimationFrame(animationID);
                }, 100);

                // only when shape is created enable removal
                shape.onclick = () => {
                    svg.removeChild(shape);
                };

                svg.style.cursor = "default";
                svg.onmousedown = undefined;
                svg.onmousemove = undefined;
                svg.onmouseup = undefined;

                // unhide jack
                jack.style.opacity = "1";

                // this.stopMovingCable(event);

                shapeFoldAnimation.setAttribute("attributeName", "points");
                shapeFoldAnimation.setAttribute("from", pointsString);
                shapeFoldAnimation.setAttribute("to", initalPosition);
                shapeFoldAnimation.setAttribute("dur", "0.5s");
                shapeFoldAnimation.setAttribute("fill", "freeze");

                shape.appendChild(shapeFoldAnimation);
                shapeFoldAnimation.beginElement();

                shapeFoldAnimation.onend = () => {
                    svg.removeChild(shape);
                };

                // when cable is dropped create new one from module
                this.createCable();
            };
        };
    }
    stopMovingCable(event) {
        let choosenElement = event.toElement;
        let destinationModule = undefined;
        let sourceModule = this.module;

        // if we are creating first cable there will be no output nodes
        sourceModule.nodes.output && sourceModule.nodes.output.classList.remove("hidden"); // make "new" output visible

        if (choosenElement.classList && choosenElement.parentModule) {
            destinationModule = choosenElement.parentModule; // parentModule is set on input and audio parameters only
        } else if (choosenElement.classList && choosenElement.classList.contains("destination-input")) {
            destinationModule = choosenElement.parentNode; // final destination, built-in attribute
        } else {
            return false; // something else thus kill it with fire
        }

        // Put an entry into the sourceModule's outputs
        if (!sourceModule.outcomingCables) sourceModule.outcomingCables = new Array();

        sourceModule.outcomingCables.push(this); // this is the active Cable

        // Put an entry into the destinations's inputs
        if (!destinationModule.incomingCables) destinationModule.incomingCables = new Array();

        destinationModule.incomingCables.push(this);

        // different action for input and audio parameter
        if (choosenElement.type === "input") connectModules(sourceModule, destinationModule);
        // type === audio node property name without spaces
        else connectParameter(sourceModule, destinationModule, choosenElement.type);
    }
}
