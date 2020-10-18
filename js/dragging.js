let dragObj = new Object();
dragObj.zIndex = 0;
dragObj.lastLit = null;

// Node Dragging functions - these are used for dragging the audio modules, 
// like Destination or AudioSourceBuffer.

function skipDefault(event) {
    if ((event.target.tagName != "SELECT") && (event.target.tagName != "INPUT"))
        event.preventDefault();
}

// Drag is set on head div inside the module
function startDraggingNode(event) {
    let draggedModuleHead = event.target;
    let x, y;

    dragObj.module = draggedModuleHead.parentNode;

    // Get cursor position with respect to the page.
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;

    // Save starting positions of cursor and element.
    dragObj.cursorStartX = x;
    dragObj.cursorStartY = y;
    dragObj.elStartLeft = parseInt(dragObj.module.style.left, 10);
    dragObj.elStartTop = parseInt(dragObj.module.style.top, 10);

    if (isNaN(dragObj.elStartLeft)) dragObj.elStartLeft = 0;
    if (isNaN(dragObj.elStartTop)) dragObj.elStartTop = 0;

    // Update element's z-index.
    dragObj.module.style.zIndex = ++dragObj.zIndex;

    // Capture mousemove and mouseup events on the page.
    document.addEventListener("mousemove", whileDraggingNode, true);
    document.addEventListener("mouseup", stopDraggingNode, true);
    event.preventDefault();
}

// DRAWING LINES BETWEEN MOUSE AND MODULE
function whileDraggingNode(event) {
    let x, y;
    let module = dragObj.module;

    // Get cursor position with respect to the page.
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;

    // Move drag element by the same amount the cursor has moved.
    module.style.left = (dragObj.elStartLeft + x - dragObj.cursorStartX) + 2 + "px";
    module.style.top = (dragObj.elStartTop + y - dragObj.cursorStartY) + 5 + "px";

    if (module.inputConnections) { // update any lines that point in here.

        let off = module.inputs;
        x = window.scrollX + 12;
        y = window.scrollY + 12;

        while (off) {
            x += off.offsetLeft;
            y += off.offsetTop;
            off = off.offsetParent;
        }

        module.inputConnections.forEach(connection => {
            connection.line.setAttributeNS(null, "x1", x);
            connection.line.setAttributeNS(null, "y1", y);
        });
    }

    if (module.outputConnections) { // update any lines that point out of here.
        let off = module.outputs;
        x = window.scrollX + 12;
        y = window.scrollY + 12;

        while (off) {
            x += off.offsetLeft;
            y += off.offsetTop;
            off = off.offsetParent;
        }

        module.outputConnections.forEach(connection => {
            connection.line.setAttributeNS(null, "x2", x);
            connection.line.setAttributeNS(null, "y2", y);
        });
    }

    event.preventDefault();
}


function stopDraggingNode(event) {
    // Stop capturing mousemove and mouseup events.
    document.removeEventListener("mousemove", whileDraggingNode, true);
    document.removeEventListener("mouseup", stopDraggingNode, true);
}

// This is set on the output/input div thus no checking requried
function createCable(event, moduleID) {
    let x, y;
    dragObj.module = document.getElementById(moduleID);
    console.log(dragObj.module)

    // Get the position of the originating connector with respect to the page.
    let off = event.target;
    x = window.scrollX + 12;
    y = window.scrollY + 12;

    while (off) {
        x += off.offsetLeft;
        y += off.offsetTop;
        off = off.offsetParent;
    }

    // Save starting positions of cursor and element.
    dragObj.cursorStartX = x;
    dragObj.cursorStartY = y;

    // remember if this is an input or output node, so we can match
    dragObj.originIsInput = dragObj.module.classList.contains("module-input") || dragObj.module.classList.contains("destination-input");

    dragObj.module.unlitClassname = dragObj.module.className;
    dragObj.module.className += " canConnect";

    // Create a connector visual line
    let svgns = "http://www.w3.org/2000/svg";

    let shape = document.createElementNS(svgns, "line");
    shape.setAttributeNS(null, "x1", x);
    shape.setAttributeNS(null, "y1", y);
    shape.setAttributeNS(null, "x2", x);
    shape.setAttributeNS(null, "y2", y);
    shape.setAttributeNS(null, "stroke", "black");
    shape.setAttributeNS(null, "stroke-width", "5");
    dragObj.connectorShape = shape;

    document.getElementById("svgCanvas").appendChild(shape);

    // Capture mousemove and mouseup events on the page.
    document.addEventListener("mousemove", whileDraggingConnector, true);
    document.addEventListener("mouseup", stopDraggingConnector, true);
    event.preventDefault();
    event.stopPropagation();
}

function whileDraggingConnector(event) {
    let x, y;
    let targetObj = event.toElement;

    document.getElementById("svgCanvas").classList.add("jackCursor");

    // Get cursor position with respect to the page.
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;

    // Move connector visual line
    dragObj.connectorShape.setAttributeNS(null, "x2", x);
    dragObj.connectorShape.setAttributeNS(null, "y2", y);

    // If this is a text node, use its parent element.
    if (targetObj.nodeType == 3)
        targetObj = targetObj.parentNode;


    if (targetObj.classList) { // if we don't have class, we're not a node.
        // if this is the green or red button, use its parent.
        if (targetObj.classList.contains("node"))
            targetObj = targetObj.parentNode;


        // if we're over our originating node, do nothing.
        if (targetObj == dragObj.module)
            return;

        // If we used to be lighting up a node, but we're not over it anymore,
        // unlight it.
        if (dragObj.lastLit && (dragObj.lastLit != targetObj)) {
            dragObj.lastLit.className = dragObj.lastLit.unlitClassname;
            dragObj.lastLit = null;
        }

        // light up connector point underneath, if any
        if (targetObj.classList.contains("node")) {
            if (!dragObj.lastLit || (dragObj.lastLit != targetObj)) {
                if (dragObj.originIsInput) {
                    if (targetObj.classList.contains("module-output")) {
                        targetObj.unlitClassname = targetObj.className;
                        targetObj.className += " canConnect";
                        dragObj.lastLit = targetObj;
                    }
                } else { // first node was an output, so we're looking for an input
                    if (targetObj.classList.contains("module-input") || targetObj.classList.contains("destination-input")) {
                        targetObj.unlitClassname = targetObj.className;
                        targetObj.className += " canConnect";
                        dragObj.lastLit = targetObj;
                    }
                }
            }
        }
    }
    event.preventDefault();
    event.stopPropagation();
}

// Make a connection between two connection point elements.
// the source and destination params are connection point elems, NOT
// the node elems themselves.
function connectNodes(source, destination) {
    let connectorShape = dragObj.connectorShape;
    source.className += " connected";
    destination.className += " connected";

    // Put an entry into the source's outputs
    if (!source.outputConnections)
        source.outputConnections = new Array();
    let connector = new Object();
    connector.line = connectorShape;
    connector.destination = destination;
    source.outputConnections.push(connector);

    //Make sure the connector line points go from source->dest (x1->x2)
    if (!dragObj.originIsInput) { // need to flip
        let shape = connectorShape;
        let x = shape.getAttributeNS(null, "x2");
        let y = shape.getAttributeNS(null, "y2");
        shape.setAttributeNS(null, "x2", shape.getAttributeNS(null, "x1"));
        shape.setAttributeNS(null, "y2", shape.getAttributeNS(null, "y1"));
        shape.setAttributeNS(null, "x1", x);
        shape.setAttributeNS(null, "y1", y);
    }
    // Put an entry into the destinations's inputs
    if (!destination.inputConnections)
        destination.inputConnections = new Array();
    connector = new Object();
    connector.line = connectorShape;
    connector.source = source;
    connector.destination = destination;
    destination.inputConnections.push(connector);

    // if the source has an audio node, connect them up.  
    // AudioBufferSourceNodes may not have an audio node yet.
    if (source.audioNode) {
        console.log("source ma audionode");
        source.audioNode.connect(destination.audioNode);
    }

    if (destination.onConnectInput)
        destination.onConnectInput();

    connectorShape.inputConnection = connector;
    connectorShape.destination = destination;
    connectorShape.onclick = deleteConnection;

    connectorShape = null;

    // turn diode on
    destination.classList.add("diode-on");
}

function deleteConnection() {
    let connections = this.destination.inputConnections;
    breakSingleInputConnection(connections, connections.indexOf(this.inputConnection));
}

function breakSingleInputConnection(connections, index) {
    let connector = connections[index];
    let source = connector.source;

    // delete us from their .outputConnections,
    source.outputConnections.splice(source.outputConnections.indexOf(connector.destination), 1);
    if (source.audioNode) { // they may not have an audioNode, if they're a BSN or an Oscillator
        // call disconnect() on the source,
        source.audioNode.disconnect();
        // if there's anything left in their outputConnections, re.connect() those nodes.
        // TODO: again, this will break due to source resetting.
        for (let j = 0; j < source.outputConnections.length; j++)
            source.audioNode.connect(source.outputConnections[j].destination.audioNode);
    }

    // and delete the line 
    connector.line.parentNode.removeChild(connector.line);

    // finally, remove us from the line.
    connections.splice(index, 1);
}

// Disconnect a node from all other nodes connecting to it, or that it connects to.
function disconnectNode(nodeElement) {
    if (nodeElement == null) return
    //for all nodes we connect to,
    if (nodeElement.outputConnections) {
        for (let i = 0; i < nodeElement.outputConnections.length; i++) {
            let connector = nodeElement.outputConnections[i];
            // find each dstElement and remove us from the destination.inputConnections,
            let connections = connector.destination.inputConnections;
            connections.splice(connections.indexOf(nodeElement), 1);
            // and delete the line 
            connector.line.parentNode.removeChild(connector.line);
        }
        // empty our outputConnections
        nodeElement.outputConnections = null;
    }

    // then call disconnect() on our audioNode to clear all outbound connections
    // (this is what clear the audio connection, for all outbound connections at once)
    if (nodeElement.audioNode) // we may not have an audioNode, if we're a BSN or an Oscillator
        nodeElement.audioNode.disconnect();

    //for all nodes connecting to us - (aka in us.inputConnections)
    if (nodeElement.inputConnections) {
        for (let i = 0; i < nodeElement.inputConnections.length; i++) {
            let connector = nodeElement.inputConnections[i];
            // this is trickier, because we'll have to destroy all their outbound connections.
            // TODO: this will suck for source nodes.
            let source = connector.source;
            let connections = source.outputConnections;
            // delete us from their .outputConnections,
            connections.splice(connections.indexOf(nodeElement), 1);

            if (source.audioNode) { // they may not have an audioNode, if they're a BSN or an Oscillator
                // call disconnect() on the source,
                source.audioNode.disconnect();
                // if there's anything in their outputConnections, re.connect() those nodes.
                // TODO: again, this will break due to source resetting.
                for (let j = 0; j < connections.length; j++) {
                    source.audioNode.connect(connections[i].destination.audioNode);
                }
            }

            // and delete the line 
            connector.line.parentNode.removeChild(connector.line);
        }
        // empty inputConnections
        nodeElement.inputConnections = null;
    }
    if (nodeElement.onDisconnect)
        nodeElement.onDisconnect();
}

function stopDraggingConnector(event) {
    // Stop capturing mousemove and mouseup events.
    document.removeEventListener("mousemove", whileDraggingConnector, true);
    document.removeEventListener("mouseup", stopDraggingConnector, true);

    document.getElementById("svgCanvas").classList.remove("jackCursor");

    if (dragObj.lastLit) {
        dragObj.lastLit.className = dragObj.lastLit.unlitClassname;
        dragObj.lastLit = null;
    }

    dragObj.module.className = dragObj.module.unlitClassname;

    let targetObj = event.toElement || event.target;


    // If this is a text node, use its parent element.
    if (targetObj.nodeType == 3)
        targetObj = targetObj.parentNode;

    console.log(targetObj);


    if (targetObj.classList) { // if we don't have class, we're not a node.
        // if this is the green or red button, use its parent.
        if (targetObj.classList.contains("node"))
            targetObj = targetObj.parentNode;
        else return

        if (targetObj.classList.contains("nodes"))
            targetObj = targetObj.parentNode;
        else return

        console.log(targetObj);


        // Get the position of the originating connector with respect to the page.
        let off = targetObj;
        x = window.scrollX + 12;
        y = window.scrollY + 12;

        while (off) {
            x += off.offsetLeft;
            y += off.offsetTop;
            off = off.offsetParent;
        }
        if (dragObj.module) {
            dragObj.connectorShape.setAttributeNS(null, "x2", x);
            dragObj.connectorShape.setAttributeNS(null, "y2", y);
        }

        // If we're over a connection point, make the connection
        if (dragObj.originIsInput) {

            console.log("can connect")
            connectNodes(targetObj, dragObj);
            return;


        } else { // first node was an output, so we're looking for an input
            // can connect!
            // TODO: first: swap the line endpoints so they're consistently x1->x2
            // That makes updating them when we drag nodes around easier.
            connectNodes(dragObj, targetObj);
            return;

        }
    }

    // Otherwise, delete the line
    dragObj.connectorShape.parentNode.removeChild(dragObj.connectorShape);
    dragObj.connectorShape = null;
}