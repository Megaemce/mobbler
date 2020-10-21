import createAnalyser from "./effects/createAnalyser.js";
import createBiquadFilter from './effects/createBiquadFilter.js';
import createConvolver from './effects/createConvolver.js';
import createDynamicsCompressor from './effects/createDynamicsCompressor.js';
import createGain from './effects/createGain.js';
import createOscillator from './effects/createOscillator.js';
import createDelay from './effects/createDelay.js';
import createAudioBufferSource from './effects/createAudioBufferSource.js';
import createLiveInput from './effects/createLiveInput.js';


export let audioContext;
export let lastBufferLoaded;
export let soundBuffer = new Array();
export let irBuffer = new Array();
export const sounds = ["glass-hit.ogg", "drums.ogg", "noise.ogg", "voice.ogg", "bass.ogg", "guitar.ogg", "stringbass.wav"]
export const impulseResponses = ["IR_theater.wav", "IR_hall.ogg", "IR_cathedral.wav", "concert_voices.ogg"]


// Set up the page as a drop site for audio files. When an audio file is
// dropped on the page, it will be auto-loaded as an AudioBufferSourceNode.
function initDragDropOfAudioFiles() {
    // TODO: might want this indicator back
    //	window.ondragover = function () { this.className = 'hover'; return false; };
    //	window.ondragend = function () { this.className = ''; return false; };
    window.ondrop = function (e) {
        this.className = '';
        e.preventDefault();

        let reader = new FileReader();
        reader.onload = function (event) {
            audioContext.decodeAudioData(event.target.result, function (buffer) {
                createAudioBufferSource(buffer);
            }, function () {
                alert("error loading!");
            });

        };
        reader.onerror = function (event) {
            alert("Error: " + reader.error);
        };
        lastBufferLoaded = e.dataTransfer.files[0].name;
        reader.readAsArrayBuffer(e.dataTransfer.files[0]);
        return false;
    };
}

// adding sounds to the audioContext
function loadSoundsIntoBuffer(audioContext, soundArray, outputArray) {
    soundArray.forEach((sound) => {
        let soundRequest = new XMLHttpRequest();
        soundRequest.open("GET", `./sounds/${sound}`, true);
        soundRequest.responseType = "arraybuffer";
        soundRequest.onload = function () {
            audioContext.decodeAudioData(soundRequest.response, function (buffer) {
                outputArray.push(buffer);
            });
        }
        soundRequest.send();
    })
}

// Initialization function for the page.
function init() {
    try {
        audioContext = new AudioContext();
    } catch (e) {
        alert('The Web Audio API is apparently not supported in this browser.');
    }

    initDragDropOfAudioFiles(); // set up page as a drop site for audio files

    loadSoundsIntoBuffer(audioContext, sounds, soundBuffer);
    loadSoundsIntoBuffer(audioContext, impulseResponses, irBuffer);

    // create the one-and-only destination node for the context
    let destination = document.getElementById("output");
    destination.audioNode = audioContext.destination;

    // set all the initial variables
    const initAnalyserSmoothingTimeConstant = "0.25"
    const initAnalyserMaxDecibles = "0"
    const initAnalyserType = "sine wave"

    const initAudioBufferSourceLoop = "false"
    const initAudioBufferSourceBufferIndex = "0";

    const initBiquadFrequency = 440.0;
    const initBiquadQ = 1.0;
    const initBiquadGain = 1.0;
    const initBiquadType = "lowshelf"

    const initConvolerBufferIndex = 0;
    const initConvolerNormalizer = "false";

    const initialDelayDelay = 0.2

    const initCompressorThreshold = -24.0;
    const initCompressorKnee = 20.0;
    const initCompressorRatio = 12.0;
    const initCompressorAttack = 0.003;
    const initCompressorRelease = 0.25;

    const initialGainGain = 1.0;

    const initOscillatorFrequency = 440;
    const initOscillatorDetune = 0;


    document.getElementById("cana").onmousedown = function (event) {
        createAnalyser(event, initAnalyserSmoothingTimeConstant, initAnalyserMaxDecibles, initAnalyserType);
    }
    document.getElementById("cabs").onmousedown = function (event) {
        createAudioBufferSource(event, initAudioBufferSourceLoop, initAudioBufferSourceBufferIndex);
    }
    document.getElementById("cbqf").onmousedown = function (event) {
        createBiquadFilter(event, initBiquadFrequency, initBiquadQ, initBiquadGain, initBiquadType);
    }
    document.getElementById("ccon").onmousedown = function (event) {
        createConvolver(event, initConvolerBufferIndex, initConvolerNormalizer);
    }
    document.getElementById("cdel").onmousedown = function (event) {
        createDelay(event, initialDelayDelay);
    }
    document.getElementById("cdyc").onmousedown = function (event) {
        createDynamicsCompressor(event, initCompressorThreshold, initCompressorKnee, initCompressorRatio, initCompressorAttack, initCompressorRelease);
    }
    document.getElementById("cgai").onmousedown = function (event) {
        createGain(event, initialGainGain);
    }
    document.getElementById("cliv").onmousedown = function (event) {
        createLiveInput(event);
    }
    document.getElementById("cosc").onmousedown = function (event) {
        createOscillator(event, initOscillatorFrequency, initOscillatorDetune);
    }


}

window.addEventListener('load', init, false);