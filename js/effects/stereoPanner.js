import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function stereoPanner(event, initialPan) {
    const pan = parseFloat(initialPan || 0);
    const panInfo = "Amount of panning to apply. Full left pan is -1 and full right pan is 1";

    const module = new Module("stereo panner", true, false, false, undefined);

    module.audioNode = new StereoPannerNode(audioContext);

    module.createSlider("pan", pan, -1, 1, 0.1, undefined, false, panInfo);

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
