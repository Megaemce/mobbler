import createAnalyser from "./effects/createAnalyser.js";
import createBiquadFilter from "./effects/createBiquadFilter.js";
import createConvolver from "./effects/createConvolver.js";
import createDynamicsCompressor from "./effects/createDynamicsCompressor.js";
import createGain from "./effects/createGain.js";
import createOscillator from "./effects/createOscillator.js";
import createDelay from "./effects/createDelay.js";
import createAudioBufferSource from "./effects/createAudioBufferSource.js";
import createLiveInput from "./effects/createLiveInput.js";

let audioContext;

// adding sounds to the audioContext
function loadFilesIntoAudioContext(audioContext, soundArray, isSound) {
    let nameBufferDictonary = new Object();
    soundArray.forEach((fileName) => {
        let soundRequest = new XMLHttpRequest();
        soundRequest.open("GET", `./sounds/${fileName}`, true);
        soundRequest.responseType = "arraybuffer";
        soundRequest.onload = function () {
            audioContext.decodeAudioData(soundRequest.response, function (buffer) {
                nameBufferDictonary[fileName] = buffer;
            });
        };
        soundRequest.send();
    });
    isSound ? (audioContext.nameSoundBuffer = nameBufferDictonary) : (audioContext.nameIRBuffer = nameBufferDictonary);
}

// Initialization function for the page.
function init() {
    // set all the initial variables

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

    try {
        audioContext = new AudioContext();
    } catch (e) {
        alert("The Web Audio API is not supported in this browser.");
    }

    loadFilesIntoAudioContext(audioContext, sounds, true);
    loadFilesIntoAudioContext(audioContext, impulseResponses, false);

    // hook audioContent final destination only to destination element.
    document.getElementById("destination").audioNode = audioContext.destination;
    document.getElementById("destination-input").type = "input"; // Keep type info for stopMovingCable

    document.getElementById("cana").onmousedown = (event) => {
        createAnalyser(event, initAnalyserSmoothingTimeConstant, initAnalyserMaxDecibles, initAnalyserType);
    };
    document.getElementById("cabs").onmousedown = (event) => {
        createAudioBufferSource(event, initAudioBufferSourceLoop, initAudioBufferSourceBufferName);
    };
    document.getElementById("cbqf").onmousedown = (event) => {
        createBiquadFilter(event, initBiquadFrequency, initBiquadQ, initBiquadGain, initBiquadType);
    };
    document.getElementById("ccon").onmousedown = (event) => {
        createConvolver(event, initConvolerBufferName, initConvolerNormalizer);
    };
    document.getElementById("cdel").onmousedown = (event) => {
        createDelay(event, initialDelayDelay, initialDelayMaxDelay);
    };
    document.getElementById("cdyc").onmousedown = (event) => {
        createDynamicsCompressor(event, initCompressorThreshold, initCompressorKnee, initCompressorRatio, initCompressorAttack, initCompressorRelease);
    };
    document.getElementById("cgai").onmousedown = (event) => {
        createGain(event, initialGainGain);
    };
    document.getElementById("cliv").onmousedown = (event) => {
        createLiveInput(event);
    };
    document.getElementById("cosc").onmousedown = (event) => {
        createOscillator(event, initOscillatorFrequency, initOscillatorDetune);
    };
}

window.onload = init();
export default audioContext;
