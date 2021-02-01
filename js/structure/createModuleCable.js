import Line from "../classes/Line.js";
import Point from "../classes/Point.js";

function createLine(svg, jack, xPosition, yPosition) {
    let lines = [];
    let count = 12;
    let pointsString = "";
    let initalPosition = "";
    let animationID = undefined;
    let jackAnimationID = `${jack.id}-animation`;
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

    shape.onclick = () => {
        svg.removeChild(shape);
    };

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

    jack.onmousedown = function (event) {
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

        svg.onmousemove = function (event) {
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

            svg.style.cursor = "default";
            svg.onmousedown = undefined;
            svg.onmousemove = undefined;
            svg.onmouseup = undefined;

            // unhide jack
            jack.style.opacity = "1";

            //stopMovingCable(event, module);

            // shapeFoldAnimation.setAttribute("attributeName", "points");
            // shapeFoldAnimation.setAttribute("from", pointsString);
            // shapeFoldAnimation.setAttribute("to", initalPosition);
            // shapeFoldAnimation.setAttribute("dur", "0.5s");
            // shapeFoldAnimation.setAttribute("fill", "freeze");

            // shape.appendChild(shapeFoldAnimation);
            // shapeFoldAnimation.beginElement();

            // shapeFoldAnimation.onend = () => {
            //     svg.removeChild(shape);
            // }

            // when cable is dropped create new one from module
            createLine(svg, jack, xPosition, yPosition);
        };
    };
}

export default function createModuleCable(module) {
    // add animated jack
    let svg = document.getElementById("svgCanvas");
    let jack = document.createElementNS("http://www.w3.org/2000/svg", "image");

    jack.setAttribute("href", "./img/jack_cleared.svg");
    jack.setAttribute("height", "9");
    jack.setAttribute("y", "-4.5");
    jack.setAttribute("id", `${module.id}-jack`);

    jack.onmouseover = () => {
        svg.style.cursor = "grab";
    };
    jack.onmouseout = () => {
        if (svg.style.cursor === "grab") svg.style = "cursor: default";
    };

    createLine(svg, jack, module.getBoundingClientRect().right, module.getBoundingClientRect().top + 10);
}
