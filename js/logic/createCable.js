import stopMovingCable from "./stopMovingCable.js";
import Cable from "../classes/Cable.js";
import Line from "../classes/Line.js";
import Point from "../classes/Point.js";


function init(canvas, startX, startY) {
    let particles = [],
        lines = [],
        animation = undefined,
        mouse = undefined,
        start = undefined,
        count = 12,
        sqrtX = startX,
        sqrtY = startY;

    for (let i = 0; i < count; ++i) {
        particles.push(new Point(sqrtX, sqrtY, 10));
        sqrtX = sqrtX + 0.5;
        sqrtY = Math.pow(sqrtX - startX, 2) + startY;
        if (i > 0) lines.push(new Line(particles[i - 1], particles[i], -Math.log(sqrtX), 0.9));
    }

    // first point
    start = particles[0];
    start.fixed = true;
    start.x = startX;
    start.y = startY;

    // Last point = mouse
    mouse = particles[count - 1];
    mouse.fixed = true;

    function updateLine() {
        lines.forEach((line) => {
            line.update()
        })

        ctx.clearRect(0, 0, width, height);

        lines.forEach((line) => {
            ctx.beginPath();
            ctx.moveTo(line.p1.x, line.p1.y);
            ctx.lineTo(line.p2.x, line.p2.y);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.stroke();
        })
        animation = window.requestAnimationFrame(updateLine)

    };

    animation = requestAnimationFrame(updateLine)

    canvas.onmousedown = function () {
        lines.forEach((line) => {
            line.gravity = true
        })
        canvas.style = "cursor: url('./img/jack_cleared.svg'), auto;"
        canvas.onmousemove = function (event) {
            mouse.x = event.offsetX + 2;
            mouse.y = event.offsetY + 4.5;
            particles[count - 2].x = event.offsetX - 3;
            particles[count - 2].y = event.offsetY + 4.5;
            particles[count - 2].fixed = true;
        }
    }
    canvas.onmouseup = () => {
        setTimeout(() => {
            window.cancelAnimationFrame(animation);
        }, 100);
        return
    }
};


export default function createCable(event, module) {
    if (!module) console.log("missing module!");

    let clickedNode = event.target;
    let canvas = document.getElementById("svgCanvas");

    // Get the position of the originating connector with respect to the page.
    let x = window.scrollX + 12;
    let y = window.scrollY + 12;
    let offset = clickedNode;

    while (offset) {
        x += offset.offsetLeft;
        y += offset.offsetTop;
        offset = offset.offsetParent;
    }

    // Save starting positions of cursor and element.
    module.cursorStartX = x;
    module.cursorStartY = y;

    // Create a connector visual line
    let svgns = "http://www.w3.org/2000/svg";

    let shape = document.createElementNS(svgns, "line");
    shape.setAttributeNS(undefined, "x1", x);
    shape.setAttributeNS(undefined, "y1", y);
    shape.setAttributeNS(undefined, "x2", x);
    shape.setAttributeNS(undefined, "y2", y);
    shape.setAttributeNS(undefined, "stroke", "black");
    shape.setAttributeNS(undefined, "stroke-width", "5");

    module.activeCable = new Cable(module, undefined, shape);

    // onmousedown is hooked to module thus working with mouse move
    // don't set listener as long as we have not started from real input
    if (module) {
        document.onmousemove = function (event) {
            canvas.classList.add("jackCursor");

            // Get cursor position with respect to the page.
            let x = event.clientX + window.scrollX;
            let y = event.clientY + window.scrollY;

            shape.setAttributeNS(undefined, "x2", x);
            shape.setAttributeNS(undefined, "y2", y);
        }
        document.onmouseup = function (event) {
            canvas.classList.remove("jackCursor");

            stopMovingCable(event, module);

            document.onmousemove = undefined;
            document.onmouseup = undefined;
        }
    }
    event.preventDefault();
    event.stopPropagation();
}