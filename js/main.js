import gain from "./modules/basics/gain.js";
import delay from "./modules/basics/delay.js";
import output from "./modules/outputs/output.js";
import chorus from "./modules/effects/chorus.js";
import wahwah from "./modules/effects/wahwah.js";
import offset from "./modules/inputs/offset.js";
import reverb from "./modules/effects/reverb.js";
import vibrato from "./modules/effects/vibrato.js";
import flanger from "./modules/effects/flanger.js";
import analyser from "./modules/outputs/analyser.js";
import envelope from "./modules/basics/envelope.js";
import crossfade from "./modules/basics/crossfade.js";
import equalizer from "./modules/basics/equalizer.js";
import convolver from "./modules/basics/convolver.js";
import liveInput from "./modules/inputs/liveInput.js";
import distortion from "./modules/effects/distortion.js";
import oscillator from "./modules/inputs/oscillator.js";
import audioSource from "./modules/inputs/audioSource.js";
import delayEffect from "./modules/effects/delayEffect.js";
import gainTremolo from "./modules/effects/gainTremolo.js";
import biquadFilter from "./modules/basics/biquadFilter.js";
import stereoPanner from "./modules/basics/stereoPanner.js";
import pannerTremolo from "./modules/effects/pannerTremolo.js";
import visualisation from "./modules/outputs/visualisation.js";
import pulseOscillator from "./modules/inputs/pulseOscillator.js";
import dynamicsCompressor from "./modules/basics/dynamicsCompressor.js";
import { loadFilesIntoAudioContext, save } from "./helpers/loaders.js";
// import { createSelectionRectangle } from "./helpers/builders.js";
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
let playButton = document.getElementById("start-button");
playButton.onclick = () => {
    try {
        audioContext = new AudioContext();
    } catch (e) {
        alert("The Web Audio API is not supported in this browser.");
    }

    loadFilesIntoAudioContext(sounds, true);
    loadFilesIntoAudioContext(impulseResponses, false);

    document.getElementById("start_screen").classList.add("hidden");

    playButton.onclick = undefined;
};

// document.getElementById("save").onmousedown = save;
document.getElementById("gain").onmousedown = gain;
document.getElementById("delay").onmousedown = delay;
document.getElementById("output").onmousedown = output;
document.getElementById("chorus").onmousedown = chorus;
document.getElementById("wahwah").onmousedown = wahwah;
document.getElementById("offset").onmousedown = offset;
document.getElementById("reverb").onmousedown = reverb;
document.getElementById("vibrato").onmousedown = vibrato;
document.getElementById("flanger").onmousedown = flanger;
document.getElementById("analyser").onmousedown = analyser;
document.getElementById("envelope").onmousedown = envelope;
document.getElementById("crossfade").onmousedown = crossfade;
document.getElementById("equalizer").onmousedown = equalizer;
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
document.getElementById("pulseOscillator").onmousedown = pulseOscillator;
document.getElementById("dynamicsCompressor").onmousedown = dynamicsCompressor;

// preventing enter key from adding space in name/parameter edition
document.onkeydown = (event) => {
    event.key === "Enter" && event.preventDefault();
};
