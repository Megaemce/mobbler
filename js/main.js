import gain from "./effects/gain.js";
import delay from "./effects/delay.js";
import output from "./effects/output.js";
import reverb from "./effects/reverb.js";
import flanger from "./effects/flanger.js";
import analyser from "./effects/analyser.js";
import convolver from "./effects/convolver.js";
import liveInput from "./effects/liveInput.js";
import distortion from "./effects/distortion.js";
import oscillator from "./effects/oscillator.js";
import audioSource from "./effects/audioSource.js";
import delayEffect from "./effects/delayEffect.js";
import gainTremolo from "./effects/gainTremolo.js";
import biquadFilter from "./effects/biquadFilter.js";
import stereoPanner from "./effects/stereoPanner.js";
import pannerTremolo from "./effects/pannerTremolo.js";
import visualisation from "./effects/visualisation.js";
import dynamicsCompressor from "./effects/dynamicsCompressor.js";
import { loadFilesIntoAudioContext } from "./helpers/loaders.js";
import { createSelectionRectangle } from "./helpers/builders.js";
// import inputOutput from "./tutorials/inputOutput.js"; // tutorial for input-output

// set all the initial variables
export let cables = {}; // keep all cables
export let modules = {}; // keep all modules
export let audioContext;

const sounds = ["diminished_slide.wav", "dnb.wav", "drums.wav", "guitar.wav", "hihat.wav", "kick.wav", "melody.mp3", , "organ.wav", "radioSignal.wav", "saxophone.wav", "snare.wav"];
const impulseResponses = ["IR_cathedral.wav", "IR_church.wav", "IR_room.wav", "IR_forest.wav", "IR_theater.wav"];

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

    document.onmousemove = undefined;
};
document.getElementById("gain").addEventListener("mousedown", gain);
document.getElementById("delay").addEventListener("mousedown", delay);
document.getElementById("output").addEventListener("mousedown", output);
document.getElementById("reverb").addEventListener("mousedown", reverb);
document.getElementById("flanger").addEventListener("mousedown", flanger);
document.getElementById("analyser").addEventListener("mousedown", analyser);
document.getElementById("convolver").addEventListener("mousedown", convolver);
document.getElementById("liveInput").addEventListener("mousedown", liveInput);
document.getElementById("distortion").addEventListener("mousedown", distortion);
document.getElementById("oscillator").addEventListener("mousedown", oscillator);
document.getElementById("audioSource").addEventListener("mousedown", audioSource);
document.getElementById("delayEffect").addEventListener("mousedown", delayEffect);
document.getElementById("gainTremolo").addEventListener("mousedown", gainTremolo);
document.getElementById("biquadFilter").addEventListener("mousedown", biquadFilter);
document.getElementById("stereoPanner").addEventListener("mousedown", stereoPanner);
document.getElementById("pannerTremolo").addEventListener("mousedown", pannerTremolo);
document.getElementById("visualisation").addEventListener("mousedown", visualisation);
document.getElementById("dynamicsCompressor").addEventListener("mousedown", dynamicsCompressor);

// preventing enter key from adding space in name/parameter edition
document.onkeydown = (event) => {
    event.key === "Enter" && event.preventDefault();
};
