import createAnalyser from "./effects/createAnalyser.js";
import createBiquadFilter from "./effects/createBiquadFilter.js";
import createConvolver from "./effects/createConvolver.js";
import createDynamicsCompressor from "./effects/createDynamicsCompressor.js";
import createGain from "./effects/createGain.js";
import createOscillator from "./effects/createOscillator.js";
import createDelay from "./effects/createDelay.js";
import createAudioSource from "./effects/createAudioSource.js";
import createLiveInput from "./effects/createLiveInput.js";
import createDistortion from "./effects/createDistortion.js";
import createDelayEffect from "./effects/createDelayEffect.js";
import createFlanger from "./effects/createFlanger.js";
import createReverb from "./effects/createReverb.js";
import createTremolo from "./effects/createTremolo.js";
import createOutput from "./effects/createOutput.js";
import { loadFilesIntoAudioContext } from "./helpers/loaders.js";
import { createSelectionRectangle } from "./helpers/builders.js";

// set all the initial variables
export let audioContext;
export let cables = new Object(); // keep all cables
export let modules = new Object(); // keep all modules

const sounds = ["glass-hit.ogg", "drums.ogg", "noise.ogg", "voice.ogg", "bass.ogg", "guitar.ogg", "stringbass.wav"];
const impulseResponses = ["IR_theater.wav", "IR_hall.ogg", "IR_cathedral.wav", "concert_voices.ogg"];

// create selection rectangle
// document.onmousedown = (event) => {
//     createSelectionRectangle(event);
// };

// start audio with user click on the canvas (chrome policy)
document.getElementById("svgCanvas").onclick = () => {
    try {
        audioContext = new AudioContext();
    } catch (e) {
        alert("The Web Audio API is not supported in this browser.");
    }

    loadFilesIntoAudioContext(sounds, true);
    loadFilesIntoAudioContext(impulseResponses, false);

    document.getElementById("analyser").addEventListener("mousedown", createAnalyser);
    document.getElementById("audioSource").addEventListener("mousedown", createAudioSource);
    document.getElementById("biquadFilter").addEventListener("mousedown", createBiquadFilter);
    document.getElementById("convolver").addEventListener("mousedown", createConvolver);
    document.getElementById("delayNode").addEventListener("mousedown", createDelay);
    document.getElementById("dynamicsCompressor").addEventListener("mousedown", createDynamicsCompressor);
    document.getElementById("gainNode").addEventListener("mousedown", createGain);
    document.getElementById("liveInput").addEventListener("mousedown", createLiveInput);
    document.getElementById("oscillator").addEventListener("mousedown", createOscillator);
    document.getElementById("distortion").addEventListener("mousedown", createDistortion);
    document.getElementById("delayEffect").addEventListener("mousedown", createDelayEffect);
    document.getElementById("flanger").addEventListener("mousedown", createFlanger);
    document.getElementById("reverb").addEventListener("mousedown", createReverb);
    document.getElementById("tremolo").addEventListener("mousedown", createTremolo);
    document.getElementById("output").onmousedown = () => {
        document.getElementById("output").style.visibility = "hidden";
        createOutput;
    };
    // remove hook from svg
    document.getElementById("svgCanvas").onclick = undefined;
};
