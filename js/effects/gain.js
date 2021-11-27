import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function gain(event, initalGain) {
    const gain = initalGain || 0.5;
    const gainInfo = "Multiplication of sound volume";

    let module = new Module("gain", true, false, false, undefined);

    module.audioNode = audioContext.createGain();

    module.createSlider("gain", gain, 0, 1, 0.1, "", false, gainInfo);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
