import createAnalyser from "./effects/createAnalyser.js";
import createBiquadFilter from "./effects/createBiquadFilter.js";
import createConvolver from "./effects/createConvolver.js";
import createDynamicsCompressor from "./effects/createDynamicsCompressor.js";
import createGain from "./effects/createGain.js";
import createOscillator from "./effects/createOscillator.js";
import createDelay from "./effects/createDelay.js";
import createAudioBufferSource from "./effects/createAudioBufferSource.js";
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

    document.getElementById("analyser").onmousedown = (event) => {
        createAnalyser(event);
    };
    document.getElementById("audioBufferSource").onmousedown = (event) => {
        createAudioBufferSource(event);
    };
    document.getElementById("biquadFilter").onmousedown = (event) => {
        createBiquadFilter(event);
    };
    document.getElementById("convolver").onmousedown = (event) => {
        createConvolver(event);
    };
    document.getElementById("delayNode").onmousedown = (event) => {
        createDelay(event);
    };
    document.getElementById("dynamicsCompressor").onmousedown = (event) => {
        createDynamicsCompressor(event);
    };
    document.getElementById("gainNode").onmousedown = (event) => {
        createGain(event);
    };
    document.getElementById("liveInput").onmousedown = (event) => {
        createLiveInput(event);
    };
    document.getElementById("oscillator").onmousedown = (event) => {
        createOscillator(event);
    };
    document.getElementById("distortion").onmousedown = (event) => {
        createDistortion(event);
    };
    document.getElementById("delayEffect").onmousedown = (event) => {
        createDelayEffect(event);
    };
    document.getElementById("flanger").onmousedown = (event) => {
        createFlanger(event);
    };
    document.getElementById("reverb").onmousedown = (event) => {
        createReverb(event);
    };
    document.getElementById("tremolo").onmousedown = (event) => {
        createTremolo(event);
    };
    document.getElementById("output").onmousedown = (event) => {
        document.getElementById("output").parentNode.removeChild(document.getElementById("output"));
        createOutput(event);
    };
    // remove hook from svg
    document.getElementById("svgCanvas").onclick = undefined;
};
