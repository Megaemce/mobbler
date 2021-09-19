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
import { createSelectionRectangle } from "./helpers/builders.js";
import createDistortion from "./effects/createDistortion.js";
import createDelayEffect from "./effects/createDelayEffect.js";
import createFlanger from "./effects/createFlanger.js";
import createReverb from "./effects/createReverb.js";
import createTremolo from "./effects/createTremolo.js";

// set all the initial variables
export let audioContext;
export let cables = new Object(); // keep all cables
export let modules = new Object(); // keep all modules

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

const initDelayDelay = 0.2;
const initDelayMaxDelay = 5;

const initDelayEffectWetness = 1;
const initDelayEffectSpeed = 0.5;
const initDelayEffectDuration = 0.3;

const initDistortionOversample = "4x";

const initFlangerDelay = 0.005;
const initFlangerDepth = 0.002;
const initFlangerFeedback = 0.5;
const initFlangerSpeed = 0.25;

const initReverbDelay = 0.5;
const initReverbLevel = 1;
const initReverbBufferName = impulseResponses[1];

const initTremoloSpeed = 15;

const initCompressorThreshold = -24.0;
const initCompressorKnee = 20.0;
const initCompressorRatio = 12.0;
const initCompressorAttack = 0.003;
const initCompressorRelease = 0.25;

const initGainGain = 1.0;

const initOscillatorFrequency = 440;
const initOscillatorDetune = 0;

// create selection rectangle
document.onmousedown = (event) => {
    createSelectionRectangle(event);
};

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
        createDelay(event, initDelayDelay, initDelayMaxDelay);
    };
    document.getElementById("dynamicsCompressor").onmousedown = (event) => {
        createDynamicsCompressor(event, initCompressorThreshold, initCompressorKnee, initCompressorRatio, initCompressorAttack, initCompressorRelease);
    };
    document.getElementById("gainNode").onmousedown = (event) => {
        createGain(event, initGainGain);
    };
    document.getElementById("liveInput").onmousedown = (event) => {
        createLiveInput(event);
    };
    document.getElementById("oscillator").onmousedown = (event) => {
        createOscillator(event, initOscillatorFrequency, initOscillatorDetune);
    };
    document.getElementById("distortion").onmousedown = (event) => {
        createDistortion(event, initDistortionOversample);
    };
    document.getElementById("delayEffect").onmousedown = (event) => {
        createDelayEffect(event, initDelayEffectWetness, initDelayEffectSpeed, initDelayEffectDuration);
    };
    document.getElementById("flanger").onmousedown = (event) => {
        createFlanger(event, initFlangerDelay, initFlangerDepth, initFlangerFeedback, initFlangerSpeed);
    };
    document.getElementById("reverb").onmousedown = (event) => {
        createReverb(event, initReverbDelay, initReverbLevel, initReverbBufferName);
    };
    document.getElementById("tremolo").onmousedown = (event) => {
        createTremolo(event, initTremoloSpeed);
    };
    // remove hook from svg
    document.getElementById("svgCanvas").onclick = undefined;
};
