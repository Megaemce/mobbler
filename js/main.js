import createAnalyser from './createAnalyser.js';
import createBiquadFilter from './createBiquadFilter.js';
import createConvolver from './createConvolver.js';
import createDynamicsCompressor from './createDynamicsCompressor.js';
import createGain from './createGain.js';
import createOscillator from './createOscillator.js';
import createDelay from './createDelay.js';
import createAudioBufferSource from './createAudioBufferSource.js';
import createLiveInput from './createLiveInput.js';


export let audioContext = null;
export let lastBufferLoaded = null;
export let soundBuffer = new Array();
export let irBuffer = new Array();
export let sounds = ["glass-hit.ogg", "drums.ogg", "noise.ogg", "voice.ogg", "bass.ogg", "guitar.ogg", "stringbass.wav"]
export let impulseResponses = ["IR_theater.wav", "IR_hall.ogg", "IR_cathedral.wav", "concert_voices.ogg"]


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

// soundBuffer[i].play to play sound
// adding sounds to the audioContext
function loadSoundsIntoBuffer(audioContext, soundArray, soundBuffer) {
    soundArray.forEach((sound, index) => {
        let soundRequest = new XMLHttpRequest();
        soundRequest.open("GET", `./sounds/${sound}`, true);
        soundRequest.responseType = "arraybuffer";
        soundRequest.onload = function () {
            audioContext.decodeAudioData(soundRequest.response, function (buffer) {
                soundBuffer[index] = buffer;
            });
        }
        soundRequest.send();
    })
}

function setClickHandler(id, handler) {
    let el = document.getElementById(id);
    if (el) {
        el.addEventListener("mousedown", handler, true);
    }
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
    let dest = document.getElementById("output");
    dest.audioNode = audioContext.destination;

    setClickHandler("cabs", createAudioBufferSource);
    setClickHandler("cosc", createOscillator);
    setClickHandler("cliv", createLiveInput);
    setClickHandler("cbqf", createBiquadFilter);
    setClickHandler("cdel", createDelay);
    setClickHandler("cdyc", createDynamicsCompressor);
    setClickHandler("cgai", createGain);
    setClickHandler("ccon", createConvolver);
    setClickHandler("cana", createAnalyser);

}

window.addEventListener('load', init, false);