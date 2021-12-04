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

document.getElementById("gain").onmousedown = gain;
document.getElementById("delay").onmousedown = delay;
document.getElementById("output").onmousedown = output;
document.getElementById("reverb").onmousedown = reverb;
document.getElementById("flanger").onmousedown = flanger;
document.getElementById("analyser").onmousedown = analyser;
document.getElementById("convolver").onmousedown = convolver;
document.getElementById("liveInput").onmousedown = liveInput;
document.getElementById("distortion").onmousedown = distortion;
document.getElementById("oscillator").onmousedown = oscillator;
document.getElementById("audioSource").onmousedown = audioSource;
document.getElementById("delayEffect").onmousedown = delayEffect;
document.getElementById("gainTremolo").onmousedown = gainTremolo;
document.getElementById("biquadFilter").onmousedown = biquadFilter;
document.getElementById("stereoPanner").onmousedown = stereoPanner;
document.getElementById("pannerTremolo").onmousedown = pannerTremolo;
document.getElementById("visualisation").onmousedown = visualisation;
document.getElementById("dynamicsCompressor").onmousedown = dynamicsCompressor;

// preventing enter key from adding space in name/parameter edition
document.onkeydown = (event) => {
    event.key === "Enter" && event.preventDefault();
};
