import createAnalyser from "./effects/createAnalyser.js";
import createBiquadFilter from "./effects/createBiquadFilter.js";
import createConvolver from "./effects/createConvolver.js";
import createDynamicsCompressor from "./effects/createDynamicsCompressor.js";
import createGain from "./effects/createGain.js";
import createOscillator from "./effects/createOscillator.js";
import createDelay from "./effects/createDelay.js";
import createAudioBufferSource from "./effects/createAudioBufferSource.js";
import createLiveInput from "./effects/createLiveInput.js";
import { loadFilesIntoAudioContext } from "./helpers/loaders.js";

// set all the initial variables
export let audioContext;

const sounds = ["glass-hit.ogg", "drums.ogg", "noise.ogg", "voice.ogg", "bass.ogg", "guitar.ogg", "stringbass.wav"];
const impulseResponses = ["IR_theater.wav", "IR_hall.ogg", "IR_cathedral.wav", "concert_voices.ogg"];

const initAnalyserSmoothingTimeConstant = "0.25";
const initAnalyserMaxDecibles = "0";
const initAnalyserType = "sine wave";

const initAudioBufferSourceLoop = "false";
const initAudioBufferSourceBufferName = sounds[0];

const initBiquadFrequency = 440.0;
const initBiquadQ = 1.0;
const initBiquadGain = 1.0;
const initBiquadType = "peaking";

const initConvolerBufferName = impulseResponses[0];
const initConvolerNormalizer = "false";

const initialDelayDelay = 0.2;
const initialDelayMaxDelay = 5;

const initCompressorThreshold = -24.0;
const initCompressorKnee = 20.0;
const initCompressorRatio = 12.0;
const initCompressorAttack = 0.003;
const initCompressorRelease = 0.25;

const initialGainGain = 1.0;

const initOscillatorFrequency = 440;
const initOscillatorDetune = 0;

// start audio with user click on the canvas (chrome policy)
document.getElementById("svgCanvas").onclick = () => {
    try {
        audioContext = new AudioContext();
    } catch (e) {
        alert("The Web Audio API is not supported in this browser.");
    }

    loadFilesIntoAudioContext(sounds, true);
    loadFilesIntoAudioContext(impulseResponses, false);

    // hook audioContent final destination only to destination element.
    document.getElementById("destination").audioNode = audioContext.destination;
    document.getElementById("destination-input").type = "input"; // Keep type info for stopMovingCable

    document.getElementById("analyser").onmousedown = (event) => {
        createAnalyser(event, initAnalyserSmoothingTimeConstant, initAnalyserMaxDecibles, initAnalyserType);
    };
    document.getElementById("audioBufferSource").onmousedown = (event) => {
        createAudioBufferSource(event, initAudioBufferSourceLoop, initAudioBufferSourceBufferName);
    };
    document.getElementById("biquadFilter").onmousedown = (event) => {
        createBiquadFilter(event, initBiquadFrequency, initBiquadQ, initBiquadGain, initBiquadType);
    };
    document.getElementById("convolver").onmousedown = (event) => {
        createConvolver(event, initConvolerBufferName, initConvolerNormalizer);
    };
    document.getElementById("delayNode").onmousedown = (event) => {
        createDelay(event, initialDelayDelay, initialDelayMaxDelay);
    };
    document.getElementById("dynamicsCompressor").onmousedown = (event) => {
        createDynamicsCompressor(event, initCompressorThreshold, initCompressorKnee, initCompressorRatio, initCompressorAttack, initCompressorRelease);
    };
    document.getElementById("gainNode").onmousedown = (event) => {
        createGain(event, initialGainGain);
    };
    document.getElementById("liveInput").onmousedown = (event) => {
        createLiveInput(event);
    };
    document.getElementById("oscillator").onmousedown = (event) => {
        createOscillator(event, initOscillatorFrequency, initOscillatorDetune);
    };

    // remove hook from svg
    document.getElementById("svgCanvas").onclick = undefined;
};
