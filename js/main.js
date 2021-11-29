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
import gainTremolo from "./effects/gainTremolo.js";
import pannerTremolo from "./effects/pannerTremolo.js";
import output from "./effects/output.js";
import visualisation from "./effects/visualisation.js";
import stereoPanner from "./effects/stereoPanner.js";
import { loadFilesIntoAudioContext } from "./helpers/loaders.js";
import { createSelectionRectangle } from "./helpers/builders.js";

// set all the initial variables
export let audioContext;
export let cables = new Object(); // keep all cables
export let modules = new Object(); // keep all modules
export { audioSource as audioSource };

const sounds = ["classic_guitar.wav", "diminished_slide.wav", "drums.mp3", "male_voice.wav", "melody.wav", "saxophone.wav", "stringbass.wav", "white_noise.wav"];
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

    document.getElementById("analyser").addEventListener("mousedown", analyser);
    document.getElementById("audioSource").addEventListener("mousedown", audioSource);
    document.getElementById("biquadFilter").addEventListener("mousedown", biquadFilter);
    document.getElementById("convolver").addEventListener("mousedown", convolver);
    document.getElementById("delay").addEventListener("mousedown", delay);
    document.getElementById("dynamicsCompressor").addEventListener("mousedown", dynamicsCompressor);
    document.getElementById("gain").addEventListener("mousedown", gain);
    document.getElementById("stereoPanner").addEventListener("mousedown", stereoPanner);
    document.getElementById("liveInput").addEventListener("mousedown", liveInput);
    document.getElementById("oscillator").addEventListener("mousedown", oscillator);
    document.getElementById("distortion").addEventListener("mousedown", distortion);
    document.getElementById("delayEffect").addEventListener("mousedown", delayEffect);
    document.getElementById("flanger").addEventListener("mousedown", flanger);
    document.getElementById("reverb").addEventListener("mousedown", reverb);
    document.getElementById("gainTremolo").addEventListener("mousedown", gainTremolo);
    document.getElementById("pannerTremolo").addEventListener("mousedown", pannerTremolo);
    document.getElementById("output").addEventListener("mousedown", output);
    document.getElementById("visualisation").addEventListener("mousedown", visualisation);
    // preventing enter key from adding space in name/parameter edition
    document.onkeydown = (event) => {
        event.key === "Enter" && event.preventDefault();
    };
    // remove hook from svg
    document.onmousemove = undefined;
};
