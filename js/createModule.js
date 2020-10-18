let tempx = 50,
    tempy = 150,
    id = 0;

export default function createModule(name, hasInput, hasOutput, hasLooper, hasNormalizer, arrayForSelect) {
    let module = document.createElement("div");
    let content = document.createElement("div");
    let head = document.createElement("div");
    let title = document.createElement("span");
    let close = document.createElement("a");
    let diode = document.createElement("div")
    let nodes = document.createElement("div");
    let footer // keep null just to test if it was created
    id++;

    module.className = "module";
    module.id = `module-${id}`;
    module.style.left = `${tempx}px`;
    module.style.top = `${tempy}px`;

    if (tempx > 700) {
        tempy += 250;
        tempx = 50;
    } else
        tempx += 250;
    if (tempy > 600)
        tempy = 100;

    diode.className = "diode"
    diode.id = `module-${id}-head-diode`;

    title.className = "title";
    title.id = `module-${id}-head-title`;
    title.appendChild(document.createTextNode(name));

    close.className = "close";
    close.id = `module-${id}-head-close`;
    close.href = "#";
    close.onclick = () => {
        disconnectNode(module);
        module.parentNode.removeChild(module);
    };

    head.className = "head"
    head.id = `module-${id}-head`
    head.addEventListener("mousedown", startDraggingNode, false);
    head.appendChild(diode);
    head.appendChild(title);
    head.appendChild(close);

    content.className = "content";
    content.id = `module-${id}-content`;

    nodes.className = "nodes"
    nodes.id = `module-${id}-nodes`


    if (hasInput) {
        let input = document.createElement("div");
        input.className = "node module-input";
        input.id = `module-${id}-nodes-input`
        input.onmousedown = function (event) {
            createCable(event, `module-${id}`);
        }
        nodes.appendChild(input);
        module.inputs = input;
    }

    if (hasOutput) {
        let output = document.createElement("div");
        output.className = "node module-output";
        output.id = `module-${id}-nodes-output`
        output.onmousedown = function (event) {
            createCable(event, `module-${id}`);
        }
        nodes.appendChild(output);
        module.outputs = output;
    }

    if (hasLooper || hasNormalizer || arrayForSelect) {
        footer = document.createElement("footer");
        footer.className = "footer";
        footer.id = `module-${id}-footer`;
        module.classList.add("has-footer")

        if (hasLooper || hasNormalizer) {
            let check = document.createElement("input");
            let label = document.createElement("label");
            let looper = document.createElement("div");

            check.type = "checkbox";
            check.id = `module-${id}-footer-checkbox`;

            if (hasLooper) {
                check.onchange = function () {
                    module.loop = this.checked;
                };

                label.appendChild(check);
                label.appendChild(document.createTextNode(" Loop"));

                looper.className = "looper";
                looper.id = `module-${id}-footer-looper`;
                looper.appendChild(label);

                module.classList.add("has-looper");
                footer.appendChild(looper);
            }

            if (hasNormalizer) {
                check.onchange = function () {
                    module.audioNode.normalize = this.checked;
                };

                label.appendChild(check);
                label.appendChild(document.createTextNode("  Norm"));

                looper.className = "normalizer";
                looper.id = `module-${id}-footer-normalizer`;
                looper.appendChild(label);

                module.classList.add("has-normalizer");
                footer.appendChild(looper);
            }
        };

        if (arrayForSelect) {
            let select = document.createElement("select");

            select.className = "ab-source";
            select.id = `${module.id}-footer-select`

            arrayForSelect.forEach((object) => {
                let option = document.createElement("option");
                option.appendChild(document.createTextNode(object));
                select.appendChild(option)
            })

            footer.appendChild(select);
        }
    }

    module.setAttribute("audioNodeType", name);
    module.appendChild(head);
    module.appendChild(content);
    module.appendChild(nodes);
    footer && module.appendChild(footer);


    // add the node into the soundfield
    document.getElementById("modules").appendChild(module);
    return (module);
}