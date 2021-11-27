import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function panner(event, initialPan) {
    const pan = initialPan || 0;
    const panInfo = "Aount of panning to apply. -1 is full left pan and 1 is full right pan";

    let module = new Module("panner", true, false, false, undefined);

    module.audioNode = audioContext.createStereoPanner();

    module.createSlider("pan", pan, -1, 1, 0.1, undefined, false, panInfo);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
