import Module from "./Module.js";
import { audioContext } from "../main.js";

export default class Visualizer extends Module {
    constructor(name, typeList, type, canvasWidth, canvasHeight, fftSizeSineWave, fftSizeFrequencyBars, maxDecibels, smoothingTimeConstant) {
        super(name, true, false, false, typeList);
        this.fft = fftSizeSineWave === undefined ? fftSizeFrequencyBars : fftSizeFrequencyBars;
        this.type = type;
        this.audioNode = new AnalyserNode(audioContext, { fftSize: this.fftSize });
        this.listeningID = undefined; // keep animationFrameID for listener
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        if (maxDecibels !== undefined) this.audioNode.maxDecibels = maxDecibels;
        if (smoothingTimeConstant !== undefined) this.audioNode.smoothingTimeConstant = smoothingTimeConstant;
        this.buildCanvasStucture();
        this.startListeningOnInput();
    }
    /* build HTML base for actual animated canvas */
    buildCanvasStucture() {
        const module = this;
        const canvas = document.createElement("canvas");
        const canvasDiv = document.createElement("div");

        module.content.controllers.classList.add("visualisation"); // controls flex-direction

        canvas.id = `${module.id}-content-controllers-canvas`;
        canvas.height = module.canvasHeight;
        canvas.width = module.canvasWidth;
        canvas.className = "canvas";

        module.content.controllers.appendChild(canvasDiv);
        module.content.controllers.canvasDiv = canvasDiv;

        module.content.controllers.canvasDiv.appendChild(canvas);
        module.content.controllers.canvasDiv.canvas = canvas;
        module.content.controllers.canvasDiv.className = "analyser";

        this.ctx = module.content.controllers.canvasDiv.drawingContext = canvas.getContext("2d");
        this.canvas = canvas;
    }
    /* set listener on input - performance tweak - don't waste resource on animated empty signal */
    startListeningOnInput() {
        let listen = () => {
            this.listeningID = requestAnimationFrame(listen);

            if (this.inputActivity) {
                window.cancelAnimationFrame(this.listeningID);
                if (this.name === "visualisation") this.createAnalyser("free");
                else this.createAnalyser(this.content.options.select.value);
            }
        };
        listen();
    }
    /* create analyser on this module*/
    createAnalyser(type) {
        const img = new Image(); // used for pattern
        const ctx = this.ctx;
        const module = this;
        const canvas = this.canvas;

        img.src = "./img/pattern.svg";

        if (type === "frequency bars") {
            /*   ꞈ
             256 ┤╥╥                    
                 │║║  ╥╥          ╥╥╥╥          
                 │║║╥╥║║        ╥╥║║║║          
                 │║║║║║║╥╥    ╥╥║║║║║║╥╥    ╥╥      ╥╥  
                 │║║║║║║║║╥╥╥╥║║║║║║║║║║╥╥╥╥║║╥╥╥╥╥╥║║  
               0 ┼──────────────frequency─────────────┬─›
                 0                                 24000Hz  
            */
            const bufferLength = module.audioNode.frequencyBinCount; //it's always half of fftSize
            const dataArray = new Uint8Array(bufferLength);
            const barWidth = (module.canvasWidth / bufferLength) * 2.5;

            let drawBar = () => {
                module.animationID["analyser"] = requestAnimationFrame(drawBar);

                // data returned in dataArray array will in range [0,255]
                module.audioNode.getByteFrequencyData(dataArray);

                ctx.fillStyle = ctx.createPattern(img, "repeat");
                ctx.fillRect(0, 0, module.canvasWidth, module.canvasHeight);

                let x = 0;

                dataArray.forEach((element) => {
                    // contex grid is upside down so we substract from y value
                    const y = module.canvasHeight - (module.canvasHeight * element) / 256;

                    ctx.fillStyle = `rgb(98, 255, ${element - 100})`;
                    ctx.fillRect(x, y, barWidth, module.canvasHeight);

                    x += barWidth + 1; // make pixel space between bars
                });
            };
            drawBar();
        }
        if (type === "spectogram") {
            /*   ꞈ
            ∞ Hz ┤                    
                 │                      
                 │     ̶̛̙͇͉̼̺͔͓͖̤͔̟̟̠̰͕͔͑̽̍̽̓̋̆̂͆́̈́͗̕¸̷̶̛̫̤̲͓̙͇͉̼̺͔͓͖̤͔̟̟̠̰͕͔̈́̌͒̽̍̊̀̈́̿̐̓͌͆͑͑̽̍̽̓̋̆̂͆́̈́͗̕ ̸̨̨̛̹͙̖̩̦̹͈̟̖̼̱̖͙͇̥̰̙̟̤̥̭̖̫̠͔̱̀̋͗̎̽̂͗͗̎̏́̓̋͑̓̔̈́͜͝͝͝  ¸̷̢̡̢̯̜͉͎̦͉̖͈͇̬̘̖͈̹̜͂͝ͅ         ̶̛̙͇͉̼̺͔͓͖̤͔̟̟̠̰͕͔͑̽̍̽̓̋̆̂͆́̈́͗̕¸̷̶̛̫̤̲͓̙͇͉̼̺͔͓͖̤͔̟̟̠̰͕͔̈́̌͒̽̍̊̀̈́̿̐̓͌͆͑͑̽̍̽̓̋̆̂͆́̈́͗̕¸̶͕̠͈͎̖̮̘̂̓͐́͗̌̀̀̇̈̈̊̈́͑̕͜     ̶̛̙͇͉̼̺͔͓͖̤͔̟̟̠̰͕͔͑̽̍̽̓̋̆̂͆́̈́͗̕¸̷̶̛̫̤̲͓̙͇͉̼̺͔͓͖̤͔̟̟̈́̌͒̽̍̊̀̈́̿̐̓͌͆͑͑̽̍̽̓̋̆̂͆́̈́͗̕             
                 │.̵̧͕̟͇̠͓͎̥͊̇͌́̎̿́̒͆͒͂̉̓̒͒̋̃̋͊̾͒͌̓̀͝͝͝.¸̶͕̠͈͎̖̮̘̂̓͐́͗̌̀̀̇̈̈̊̈́͑̕͜¸̸̗̂́̒̇̾́̒͘̕̚͝͠.̵͓̖͓̲̟͋͆́̐̚͝͠͝¸̶̧̡̱̪̟̪͔͖͙̪̈́ͅ.̵̧͕̟͇̠͓͎̥͊̇͌́̎̿́̒͆͒͂̉̓̒͒̋̃̋͊̾͒͌̓̀͝͝͝¸̶͕̠͈͎̖̮̘̂̓͐́͗̌̀̀̇̈̈̊̈́͑̕͜¸̸̗̂́̒̇̾́̒͘̕̚͝͠.̵͓̖͓̲̟͋͆́̐̚͝͠͝¸̶̧̡̱̪̟̪͔͖͙̪̈́ͅ_̵̛̝̂̓́͋̆͊͂̀̍̊̏̓͂̂͒͌̚͝ ¸̶͕̠͈͎̖̮̘̂̓͐́͗̌̀̀̇̈̈̊̈́͑̕͜ ,̸̮͉̤̹̬̜͖̞͚͈̥̈́̇̀̈̂̏́̆̈́͛̾̚͝   .̵̧͕̟͇̠͓͎̥͊̇͌́̎̿́̒͆͒͂̉̓̒͒̋̃̋͊̾͒͌̓̀͝͝͝.¸̶͕̠͈͎̖̮̘̂̓͐́͗̌̀̀̇̈̈̊̈́͑̕͜¸̸̗̂́̒̇̾́̒͘̕̚͝͠         
                 │  
               0 ┼─────────────────time──────────────┬›
                 0                                  ∞ sec  
            */

            const bufferLength = module.audioNode.frequencyBinCount; //it's always half of fftSize
            const dataArray = new Uint8Array(bufferLength);
            const bandHeight = module.canvasHeight / bufferLength;

            module.content.controllers.canvasDiv.className = "analyser spectro"; // white background

            // taken from: https://github.com/urtzurd/html-audio/blob/gh-pages/static/js/pitch-shifter.js#L253
            let drawBar = () => {
                module.animationID["analyser"] = requestAnimationFrame(drawBar);

                // data returned in dataArray array will in range [0,255]
                module.audioNode.getByteFrequencyData(dataArray);

                const previousImage = ctx.getImageData(1, 0, module.canvasWidth - 1, module.canvasHeight);
                ctx.putImageData(previousImage, 0, 0);

                for (let i = 0, y = module.canvasHeight - 1; i < bufferLength; i++, y -= bandHeight) {
                    const color = dataArray[i] << 16;
                    ctx.fillStyle = "#" + color.toString(16);
                    ctx.fillRect(module.canvasWidth - 1, y, 1, -bandHeight);
                }
            };
            drawBar();
        }
        if (type === "sine wave") {
            /*   ꞈ
             256 ┤            .¸            
                 │.¸     ¸.¸·՜   ՝·¸                  
                 │  ՝·¸·՜           `.¸         
                 │                    ՝·     ¸·`՝·¸¸.¸¸   
                 │                      ՝·..·՜         `
               0 ┼────────────────time─────────────────┬›
                 0                                    ∞ sec
            */
            let bufferLength = module.audioNode.fftSize;
            let dataArray = new Uint8Array(bufferLength);

            let drawWave = () => {
                module.animationID["analyser"] = requestAnimationFrame(drawWave);

                module.audioNode && module.audioNode.getByteTimeDomainData(dataArray);
                // data returned in dataArray will be in range [0,255]

                let pattern = ctx.createPattern(img, "repeat");
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, module.canvasWidth, module.canvasHeight);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "rgb(98, 255, 0)";
                ctx.beginPath();

                // element range: [0, 255], index range: [0, bufferLength]
                dataArray.forEach((element, index) => {
                    let x = (module.canvasWidth / bufferLength) * index; // sliceWidth * index
                    let y = module.canvasHeight * (element / 256); // 256 comes from dataArray max value;
                    if (!index === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });

                ctx.stroke();
            };
            drawWave();
        }
        if (type === "free") {
            /*                                  Mode "create lines from frequencies chart"
                 ꞈ                                                             
             256 ┤                                        ┌                     ┐
                 │՝·¸                                        ՝·¸    ¸·¸      ¸.¸         duplicate k-time
                 │   `.     ¸.·¸        > duplicate and >      `·¸՜    ՝·ֻ՜ ̗`·՝    ՝   >  rotate (angleRad * k))
                 │      ՝·.·՝     ՝·¸¸·     flip y values       ·՜   ՝·.·՜     ՝·¸·֬        k ∊ [1...symmetries]
                 │                                          ·՜                         
               0 ┼──TimeDomainData──┬›                    └                     ┘            
                 0                 ∞ sec    
                                                Mode "create lines from time domain chart"
                 ꞈ
             256 ┤╥                                       ┌                     ┐
                 │║ ╥     ╥╥                                ՝·¸    ¸·¸      ¸.¸         duplicate k-time
                 │║╥║    ╥║║            > duplicate and >      `·¸՜    ՝·ֻ՜ ̗`·՝    ՝   >  rotate (angleRad * k))
                 │║║║╥  ╥║║║╥  ╥   ╥      flip y values       ·՜   ՝·.·՜     ՝·¸·֬        k ∊ [1...symmetries]
                 │║║║║╥╥║║║║║╥╥║╥╥╥║                        ·՜                         
               0 ┼───FrequencyData──┬›                    └                     ┘
                 0               24000Hz
             */

            const bufferLength = module.audioNode.frequencyBinCount; //it's always half of fftSize
            const dataArray = new Uint8Array(bufferLength);

            // fullscreen exiting handlers
            document.addEventListener("fullscreenchange", exitHandler);
            document.addEventListener("webkitfullscreenchange", exitHandler);
            document.addEventListener("mozfullscreenchange", exitHandler);
            document.addEventListener("MSFullscreenChange", exitHandler);

            function exitHandler() {
                if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
                    canvas.width = module.canvasWidth;
                    canvas.height = module.canvasHeight;
                }
            }

            module.head.buttonsWrapper.maximize.onclick = () => {
                if (canvas.requestFullScreen) canvas.requestFullScreen();
                else if (canvas.webkitRequestFullScreen) canvas.webkitRequestFullScreen();
                else if (canvas.mozRequestFullScreen) canvas.mozRequestFullScreen();

                canvas.width = window.screen.width;
                canvas.height = window.screen.height;
            };

            let drawFreely = () => {
                // need to be here not ouside as the canvas height/width get updated on fullscreen
                const scale = canvas.height * module.audioNode.lineFlatness.value;
                const barWidth = canvas.width / bufferLength;
                // need to be inside as the parameters get changed
                const angle = 360 / module.audioNode.symmetries.value;
                const angleRad = (angle * Math.PI) / 180;
                const lineLength = module.audioNode.lineLength.value;

                module.animationID["analyser"] = requestAnimationFrame(drawFreely);

                // data returned in dataArrayBars will be in range [0,255]
                if (module.audioNode) {
                    if (module.audioNode.type === "create lines from frequencies chart") {
                        module.audioNode.getByteFrequencyData(dataArray);
                    }
                    if (module.audioNode.type === "create lines from time domain chart") {
                        module.audioNode.getByteTimeDomainData(dataArray);
                    }
                }

                ctx.strokeStyle = `hsl(${module.audioNode.color.value}, 100%, 50%)`;

                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.scale(module.audioNode.zoom.value, module.audioNode.zoom.value);
                ctx.lineWidth = module.audioNode.lineWidth.value;

                for (let k = 0; k < module.audioNode.symmetries.value; k++) {
                    ctx.rotate(angleRad);

                    ctx.beginPath();

                    // element range: [0, 255], index range: [0, bufferLength]
                    dataArray.forEach((element, index) => {
                        const x = barWidth * lineLength * index;
                        const y = scale * (element / 256); // 256 comes from dataArrayWave max value;
                        if (!index === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });

                    ctx.stroke();
                    ctx.beginPath();

                    // element range: [0, 255], index range: [0, bufferLength]
                    dataArray.forEach((element, index) => {
                        const x = barWidth * lineLength * index;
                        const y = -scale * (element / 256); // 256 comes from dataArrayWave max value;
                        if (!index === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });

                    ctx.stroke();
                }

                ctx.restore();
            };
            drawFreely();
        }
    }
    /* reset all animationFrame, contextCanvas and start listening again on input */
    resetAnalyser() {
        window.cancelAnimationFrame(this.animationID["analyser"]);
        window.cancelAnimationFrame(this.listeningID);
        this.ctx && this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.startListeningOnInput();
    }
    /* when deleting the module stop the animationFrames */
    onDeletion() {
        window.cancelAnimationFrame(this.animationID["analyser"]);
        window.cancelAnimationFrame(this.listeningID);
    }
}
