// updating cable position while node is in move
export default function whileMovingModule(event, module) {

    // Get cursor position with respect to the page.
    let x = event.clientX + window.scrollX;
    let y = event.clientY + window.scrollY;

    // Move drag element by the same amount the cursor has moved.
    module.style.left = (module.elStartLeft + x - module.cursorStartX) + 2 + "px";
    module.style.top = (module.elStartTop + y - module.cursorStartY) + 5 + "px";

    if (module.incomingCables) { // update any lines that point in here.

        let off = module;
        x = window.scrollX + 12;
        y = window.scrollY + 12;

        while (off) {
            x += off.offsetLeft;
            y += off.offsetTop;
            off = off.offsetParent;
        }

        module.incomingCables.forEach(cable => {
            cable.updateEndPoint(x, y)
        });
    }

    if (module.outcomingCables) { // update any lines that point out of here.
        let off = module.outputs;
        x = window.scrollX + 12;
        y = window.scrollY + 12;

        while (off) {
            x += off.offsetLeft;
            y += off.offsetTop;
            off = off.offsetParent;
        }

        module.outcomingCables.forEach(cable => {
            cable.updateStartPoint(x, y)
        });
    }

    event.preventDefault();
}