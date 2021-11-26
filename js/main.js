import analyser from "./effects/analyser.js";
import biquadFilter from "./effects/biquadFilter.js";
import convolver from "./effects/convolver.js";
import dynamicsCompressor from "./effects/dynamicsCompressor.js";
import gain from "./effects/gain.js";
import oscillator from "./effects/oscillator.js";
import delay from "./effects/delay.js";
import audioSource from "./effects/audioSource.js";
import liveInput from "./effects/liveInput.js";
import distortion from "./effects/distortion.js";
import delayEffect from "./effects/delayEffect.js";
import flanger from "./effects/flanger.js";
import reverb from "./effects/reverb.js";
import tremolo from "./effects/tremolo.js";
import output from "./effects/output.js";
import visualisation from "./effects/visualisation.js";
import { loadFilesIntoAudioContext } from "./helpers/loaders.js";
import { createSelectionRectangle } from "./helpers/builders.js";

// set all the initial variables
export let audioContext;
export let cables = new Object(); // keep all cables
export let modules = new Object(); // keep all modules
export { audioSource as audioSource };

const sounds = ["glass-hit.ogg", "drums.ogg", "noise.ogg", "voice.ogg", "bass.ogg", "guitar.ogg", "stringbass.wav"];
const impulseResponses = ["IR_theater.wav", "IR_hall.ogg", "IR_cathedral.wav", "concert_voices.ogg"];

// create selection rectangle
// document.onmousedown = (event) => {
//     createSelectionRectangle(event);
// };

// start audio with user interaction (chrome policy)
document.onmousemove = () => {
    try {
        audioContext = new AudioContext();
    } catch (e) {
        alert("The Web Audio API is not supported in this browser.");
    }

    loadFilesIntoAudioContext(sounds, true);
    loadFilesIntoAudioContext(impulseResponses, false);

    document.getElementById("analyser").addEventListener("mousedown", analyser);
    document.getElementById("audioSource").addEventListener("mousedown", audioSource);
    document.getElementById("biquadFilter").addEventListener("mousedown", biquadFilter);
    document.getElementById("convolver").addEventListener("mousedown", convolver);
    document.getElementById("delayNode").addEventListener("mousedown", delay);
    document.getElementById("dynamicsCompressor").addEventListener("mousedown", dynamicsCompressor);
    document.getElementById("gainNode").addEventListener("mousedown", gain);
    document.getElementById("liveInput").addEventListener("mousedown", liveInput);
    document.getElementById("oscillator").addEventListener("mousedown", oscillator);
    document.getElementById("distortion").addEventListener("mousedown", distortion);
    document.getElementById("delayEffect").addEventListener("mousedown", delayEffect);
    document.getElementById("flanger").addEventListener("mousedown", flanger);
    document.getElementById("reverb").addEventListener("mousedown", reverb);
    document.getElementById("tremolo").addEventListener("mousedown", tremolo);
    document.getElementById("output").addEventListener("mousedown", output);
    document.getElementById("visualisation").addEventListener("mousedown", visualisation);
    // preventing enter key from adding space in name/parameter edition
    document.onkeydown = (event) => {
        event.key === "Enter" && event.preventDefault();
    };
    // remove hook from svg
    document.onmousemove = undefined;
};
