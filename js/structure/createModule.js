import createCable from "../logic/createCable.js";
import disconnectModule from "../logic/disconnectModule.js"
import movingModule from "../logic/movingModule.js";

let tempx = 50,
    tempy = 100,
    id = 0;

export default function createModule(name, hasInput, hasLooper, hasNormalizer, arrayForSelect) {
    let mainWidth = document.getElementById("modules").offsetWidth;
    let module = document.createElement("div");
    let head = document.createElement("div");
    let title = document.createElement("span");
    let close = document.createElement("a");
    let diode = document.createElement("div");
    let content = document.createElement("div");
    let options = document.createElement("div");
    let controllers = document.createElement("div");
    let nodes = document.createElement("div");
    let output = document.createElement("div");
    let footer = undefined; // keep undefined just to test if it was created
    id++;

    module.className = "module";
    module.id = `module-${id}`;
    module.style.left = `${tempx}px`;
    module.style.top = `${tempy}px`;

    if (tempx > mainWidth - 450) {
        tempy += 300;
        tempx = 50 + id;
    } else
        tempx += 300;
    if (tempy > window.innerHeight - 300)
        tempy = 100 + id;

    diode.className = "diode"
    diode.id = `module-${id}-head-diode`;

    title.className = "title";
    title.id = `module-${id}-head-title`;
    title.appendChild(document.createTextNode(name));

    close.className = "close";
    close.id = `module-${id}-head-close`;
    close.href = "#";
    close.onclick = () => {
        disconnectModule(module);
        module.parentNode.removeChild(module);
    };

    head.className = "head"
    head.id = `module-${id}-head`
    head.onmousedown = function (event) {
        movingModule(event, module)
    }
    head.appendChild(diode);
    head.appendChild(title);
    head.appendChild(close);

    options.className = "options"
    options.id = `module-${id}-content-options`

    if (hasLooper || hasNormalizer || arrayForSelect) {
        if (arrayForSelect) {
            let select = document.createElement("select");

            select.className = "ab-source";
            select.id = `module-${id}-content-options-select`

            arrayForSelect.forEach((object) => {
                let option = document.createElement("option");
                option.appendChild(document.createTextNode(object));
                select.appendChild(option)
            })

            options.appendChild(select);
        }
        if (hasLooper || hasNormalizer) {
            let check = document.createElement("input");
            let label = document.createElement("label");
            let looper = document.createElement("div");

            check.type = "checkbox";
            check.id = `module-${id}-content-options-checkbox`;

            if (hasLooper) {
                check.onchange = function () {
                    module.loop = this.checked;
                };

                label.htmlFor = `module-${id}-content-options-looper`;
                label.appendChild(document.createTextNode("Loop"));

                looper.className = "looper";
                looper.id = `module-${id}-content-options-looper`;
                looper.appendChild(check);
                looper.appendChild(label);

                module.classList.add("has-looper");
                options.appendChild(looper);
            }

            if (hasNormalizer) {
                check.onchange = function () {
                    module.audioNode.normalize = this.checked;
                };

                label.htmlFor = `module-${id}-content-options-looper`;
                label.appendChild(document.createTextNode("Norm"));

                looper.className = "normalizer";
                looper.id = `module-${id}-content-options-normalizer`;
                looper.appendChild(check);
                looper.appendChild(label);

                module.classList.add("has-normalizer");
                options.appendChild(looper);
            }
        };
        content.appendChild(options)
    }

    controllers.className = "controllers"
    controllers.id = `module-${id}-content-controllers`

    content.className = "content";
    content.id = `module-${id}-content`;

    content.appendChild(controllers);

    nodes.className = "nodes"
    nodes.id = `module-${id}-nodes`

    if (hasInput) {
        let input = document.createElement("div");
        input.className = "node module-input";
        input.id = `module-${id}-nodes-input`
        nodes.appendChild(input);
        module.inputs = input;
    }

    output.className = "node module-output";
    output.id = `module-${id}-nodes-output`
    output.onmousedown = function (event) {
        createCable(event, module);
    }
    nodes.appendChild(output);
    module.outputs = output;

    footer = document.createElement("footer");
    footer.className = "footer";
    footer.id = `module-${id}-footer`;
    module.classList.add("has-footer")

    module.setAttribute("audioNodeType", name);
    module.appendChild(head);
    module.appendChild(content);
    module.appendChild(nodes);
    footer && module.appendChild(footer);

    // add the node into the soundfield
    document.getElementById("modules").appendChild(module);
    return (module);
}