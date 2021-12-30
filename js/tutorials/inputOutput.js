import audioSource from "../effects/audioSource.js";
import output from "../effects/output.js";
import { displayAlertOnElement } from "../helpers/builders.js";

export default function inputOutput() {
    let inputModule = undefined;
    let outputModule = undefined;

    // step 1
    setTimeout(() => {
        inputModule = audioSource(undefined, true, "melody.mp3", undefined);
        setTimeout(displayAlertOnElement("Connect me with output module", inputModule.div, 5), 2000);
    }, 1000);

    // step 2
    setTimeout(() => {
        outputModule = output();
        outputModule.onInputConnected = () => {
            displayAlertOnElement("Now start the sound", inputModule.playButton, 2);

            // action when input will be started
            outputModule.onInputConnected = () => {
                displayAlertOnElement("You are done!", inputModule.div, 5);
            };
        };
        setTimeout(displayAlertOnElement("Connect audio source to me", outputModule.div, 3), 2000);
    }, 3500);
}
