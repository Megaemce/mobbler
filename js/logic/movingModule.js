import whileMovingModule from "./whileMovingModule.js";

let whileMovingModuleHandler;

// Node moving functions - these are used for dragging the audio modules, 
// function is set on head div inside the module
function stopMovingModule() {
    // Stop capturing mousemove and m ouseup events.
    document.removeEventListener("mousemove", whileMovingModuleHandler, true);
    document.removeEventListener("mouseup", stopMovingModule, true);
}

export default function movingModule(event, module) {
    // Get cursor position with respect to the page.
    let x = event.clientX + window.scrollX;
    let y = event.clientY + window.scrollY;

    // Save starting positions of cursor and element.
    module.cursorStartX = x;
    module.cursorStartY = y;

    module.elStartLeft = parseInt(module.style.left, 10) || 0;
    module.elStartTop = parseInt(module.style.top, 10) || 0;

    // Update element's z-index.
    ++module.style.zIndex;

    // Capture mousemove and mouseup events on the page.
    whileMovingModuleHandler = function (event) {
        whileMovingModule(event, module);
    };

    document.addEventListener("mousemove", whileMovingModuleHandler, true);
    document.addEventListener("mouseup", stopMovingModule, true);
    event.preventDefault();
}