export function addOpenFileButtonTo(element) {
    let input = document.createElement("input");
    let button = document.createElement("button");
    let option = document.createElement("option");

    input.style = "display: none;";
    input.type = "file";
    input.id = "file-input";

    button.innerText = "Open file...";
    button.id = "button";

    option.id = "file button";
    option.appendChild(button);
    option.appendChild(input);

    element.appendChild(option);
}

export function createSelectionRectangle(event) {
    let div = document.getElementById("selection-rect");
    let x1 = event.clientX;
    let y1 = event.clientY;

    document.onmousemove = (event) => {
        let x2 = event.clientX;
        let y2 = event.clientY;
        const xMin = Math.min(x1, x2);
        const xMax = Math.max(x1, x2);
        const yMin = Math.min(y1, y2);
        const yMax = Math.max(y1, y2);

        div.style.left = xMin + "px";
        div.style.top = yMin + "px";
        div.style.width = xMax - xMin + "px";
        div.style.height = yMax - yMin + "px";

        div.hidden = 0;
        div.style.zIndex = 100;
    };
    document.onmouseup = () => {
        div.hidden = 1;
        document.onmousemove = undefined;
        document.onmouseup = undefined;
        document.onmousedown = undefined; // create selection only once. Remove later!
    };
}
