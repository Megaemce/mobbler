import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

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
    const clipping = initalClipping || clippingTypes["Hard clipping"](drive);
    const gainInfo = "Multiplication of sound volume";
    const driveInfo = "Overdrive amount. Only in soft clipping";
    const precutInfo = "Pre-distortion bandpass filter frequency";
    const postcutInfo = "Post-distortion lowpass filter cutoff frequency";

    const module = new Module("distortion", true, false, false, Object.keys(clippingTypes));

    module.audioNode = {
        inputNode: new GainNode(audioContext),
        gainNode: new GainNode(audioContext),
        bandpassNode: new BiquadFilterNode(audioContext, { type: "bandpass" }),
        distortionNode: new WaveShaperNode(audioContext, { curve: clipping }),
        lowpassNode: new BiquadFilterNode(audioContext, { type: "lowpass" }),
        outputNode: new GainNode(audioContext),
        get gain() {
            return this.gainNode.gain;
        },
        set gain(value) {
            this.gainNode.gain.value = value;
        },
        get precut() {
            return this.bandpassNode.frequency;
        },
        set precut(value) {
            this.bandpassNode.frequency.value = value;
        },
        get postcut() {
            return this.lowpassNode.frequency;
        },
        set postcut(value) {
            this.lowpassNode.frequency.value = value;
        },
        get drive() {
            return this.distortionNode.drive;
        },
        set drive(value) {
            this.distortionNode.drive = value;
            this.distortionNode.curve = clippingTypes["Soft clipping"](value);
        },
        connect(destination) {
            if (destination.inputNode) this.outputNode.connect(destination.inputNode);
            else this.outputNode.connect(destination);
        },
        disconnect() {
            this.outputNode.disconnect();
        },
    };

    // custom distortion drive attribute
    module.audioNode.distortionNode.drive = { value: drive };

    module.createSlider("gain", gain, 1, 20, 1, "", false, gainInfo);
    module.createSlider("precut", precut, 0.1, 22050, 1, "Hz", true, precutInfo);
    module.createSlider("drive", drive, 0, 1, 0.1, "", false, driveInfo);
    module.createSlider("postcut", postcut, 0.1, 22050, 1, "Hz", true, postcutInfo);

    module.audioNode.inputNode.connect(module.audioNode.gainNode);
    module.audioNode.gainNode.connect(module.audioNode.bandpassNode);
    module.audioNode.bandpassNode.connect(module.audioNode.distortionNode);
    module.audioNode.distortionNode.connect(module.audioNode.lowpassNode);
    module.audioNode.lowpassNode.connect(module.audioNode.outputNode);

    module.content.options.select.value = "Hard clipping";

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
}
