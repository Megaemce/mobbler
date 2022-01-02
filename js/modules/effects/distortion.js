import Module from "../../classes/Module.js";
import Parameter from "../../classes/Parameter.js";
import { audioContext } from "../../main.js";

export default function distortion(event, initalGain, initalDrive, initalPrecut, initalPostcut, initalClipping) {
    const clippingTypes = {
        "Soft clipping": (driveValue) => {
            // taken from https://stackoverflow.com/a/52472603/4633799
            const n_samples = 256;
            const drive = driveValue * 100;
            const curve = new Float32Array(n_samples);
            for (let i = 0; i < n_samples; ++i) {
                let x = (i * 2) / n_samples - 1;
                curve[i] = ((Math.PI + drive) * x) / (Math.PI + drive * Math.abs(x));
            }
            return curve;
        },
        "Hard clipping": () => {
            return new Float32Array([-1, 1]);
        },
    };
    const gain = parseFloat(initalGain || 2);
    const drive = parseFloat(initalDrive || 0.2);
    const precut = parseFloat(initalPrecut || 800);
    const postcut = parseFloat(initalPostcut || 3000);
    const clipping = initalClipping || clippingTypes["Soft clipping"](drive);
    const gainInfo = "Multiplication of sound volume";
    const driveInfo = "Overdrive amount. Only in soft clipping";
    const precutInfo = "Pre-distortion bandpass filter frequency";
    const postcutInfo = "Post-distortion lowpass filter cutoff frequency";

    const module = new Module("distortion", true, false, false, Object.keys(clippingTypes));

    module.audioNode = {
        gainNode: new GainNode(audioContext),
        inputNode: new GainNode(audioContext),
        outputNode: new GainNode(audioContext),
        lowpassNode: new BiquadFilterNode(audioContext, { type: "lowpass" }),
        bandpassNode: new BiquadFilterNode(audioContext, { type: "bandpass" }),
        distortionNode: new WaveShaperNode(audioContext, { curve: clipping }),
        drive: new Parameter(drive, (value) => {
            module.audioNode.distortionNode.curve = clippingTypes["Soft clipping"](value);
        }),
        gain: new Parameter(gain, (value) => {
            module.audioNode.gainNode.gain.value = value;
        }),
        precut: new Parameter(precut, (value) => {
            module.audioNode.bandpassNode.frequency.value = value;
        }),
        postcut: new Parameter(postcut, (value) => {
            module.audioNode.lowpassNode.frequency.value = value;
        }),
        connect(destination) {
            if (destination.inputNode) this.outputNode.connect(destination.inputNode);
            else this.outputNode.connect(destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    module.createSlider("gain", gain, 1, 20, 1, "", false, gainInfo);
    module.createSlider("precut", precut, 0.1, 22050, 1, "Hz", true, precutInfo);
    module.createSlider("drive", drive, 0, 1, 0.1, "", false, driveInfo);
    module.createSlider("postcut", postcut, 0.1, 22050, 1, "Hz", true, postcutInfo);

    module.audioNode.gainNode.connect(module.audioNode.bandpassNode);
    module.audioNode.inputNode.connect(module.audioNode.gainNode);
    module.audioNode.lowpassNode.connect(module.audioNode.outputNode);
    module.audioNode.bandpassNode.connect(module.audioNode.distortionNode);
    module.audioNode.distortionNode.connect(module.audioNode.lowpassNode);

    module.content.options.select.value = "Soft clipping";

    module.content.options.select.onchange = function () {
        if (this.value === "Soft clipping") {
            const driveValue = module.audioNode.drive.value;
            module.audioNode.distortionNode.curve = clippingTypes["Soft clipping"](driveValue);
            module.footer.drive.classList.remove("disabled");
            module.content.controllers.drive.slider.classList.remove("not_used");
        } else {
            module.audioNode.distortionNode.curve = clippingTypes["Hard clipping"]();
            module.footer.drive.classList.add("disabled");
            module.content.controllers.drive.slider.classList.add("not_used");
        }
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();

    return module;
}
