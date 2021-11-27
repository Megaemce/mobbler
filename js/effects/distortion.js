import Module from "../classes/Module.js";
import { audioContext } from "../main.js";

export default function distortion(event, initalClipping, initalGain) {
    const gain = initalGain || 2;
    const gainInfo = "Multiplication of sound volume";
    const softClipping = new Float32Array([
        -1, -0.9989321827888489, -0.9978497624397278, -0.9967524409294128, -0.9956399202346802, -0.9945117831230164, -0.9933677911758423, -0.9922075867652893, -0.9910308122634888, -0.9898371696472168, -0.9886261820793152, -0.9873975515365601, -0.986150860786438, -0.9848856925964355, -0.9836016893386841, -0.9822983741760254, -0.980975329875946, -0.9796321392059326, -0.9782682657241821, -0.9768832921981812, -0.9754766821861267, -0.9740478992462158, -0.9725964665412903, -0.9711219072341919, -0.9696235060691833, -0.9681007862091064, -0.9665531516075134, -0.964979887008667, -0.9633805155754089, -0.9617542028427124, -0.9601004123687744, -0.9584183692932129, -0.9567072987556458, -0.9549665451049805, -0.9531952738761902, -0.9513927102088928, -0.9495579600334167, -0.9476901888847351,
        -0.9457884430885315, -0.943851888179779, -0.9418795108795166, -0.939870297908783, -0.9378231763839722, -0.935737133026123, -0.9336110353469849, -0.9314436316490173, -0.9292338490486145, -0.9269803166389465, -0.9246817827224731, -0.9223368167877197, -0.9199441075325012, -0.9175020456314087, -0.9150092005729675, -0.9124639630317688, -0.909864604473114, -0.9072093963623047, -0.9044965505599976, -0.9017241597175598, -0.8988901972770691, -0.895992636680603, -0.8930293321609497, -0.8899979591369629, -0.8868961930274963, -0.8837215304374695, -0.880471408367157, -0.8771430253982544, -0.8737335801124573, -0.8702400326728821, -0.8666592836380005, -0.8629880547523499, -0.8592227697372437, -0.8553597927093506, -0.8513953685760498, -0.847325325012207, -0.843145489692688, -0.8388512134552002,
        -0.834437906742096, -0.8299004435539246, -0.825233519077301, -0.8204315900802612, -0.8154885768890381, -0.810398280620575, -0.8051539659500122, -0.7997485399246216, -0.7941744923591614, -0.7884237766265869, -0.7824879288673401, -0.7763577103614807, -0.7700235843658447, -0.7634750604629517, -0.7567012310028076, -0.749690055847168, -0.7424290180206299, -0.7349044680595398, -0.727101743221283, -0.7190051674842834, -0.710597813129425, -0.7018615007400513, -0.6927764415740967, -0.6833213567733765, -0.6734731793403625, -0.6632068753242493, -0.6524952054023743, -0.641308605670929, -0.6296147704124451, -0.6173783540725708, -0.6045607328414917, -0.5911195278167725, -0.5770079493522644, -0.5621747374534607, -0.5465629696846008, -0.530109703540802, -0.5127451419830322, -0.49439123272895813,
        -0.4749611020088196, -0.4543571472167969, -0.4324696958065033, -0.40917497873306274, -0.3843327760696411, -0.3577835261821747, -0.32934510707855225, -0.29880836606025696, -0.26593223214149475, -0.23043709993362427, -0.19199708104133606, -0.150229811668396, -0.1046837568283081, -0.05482180789113045, 0, 0.05482180789113045, 0.1046837568283081, 0.150229811668396, 0.19199708104133606, 0.23043709993362427, 0.26593223214149475, 0.29880836606025696, 0.32934510707855225, 0.3577835261821747, 0.3843327760696411, 0.40917497873306274, 0.4324696958065033, 0.4543571472167969, 0.4749611020088196, 0.49439123272895813, 0.5127451419830322, 0.530109703540802, 0.5465629696846008, 0.5621747374534607, 0.5770079493522644, 0.5911195278167725, 0.6045607328414917, 0.6173783540725708, 0.6296147704124451,
        0.641308605670929, 0.6524952054023743, 0.6632068753242493, 0.6734731793403625, 0.6833213567733765, 0.6927764415740967, 0.7018615007400513, 0.710597813129425, 0.7190051674842834, 0.727101743221283, 0.7349044680595398, 0.7424290180206299, 0.749690055847168, 0.7567012310028076, 0.7634750604629517, 0.7700235843658447, 0.7763577103614807, 0.7824879288673401, 0.7884237766265869, 0.7941744923591614, 0.7997485399246216, 0.8051539659500122, 0.810398280620575, 0.8154885768890381, 0.8204315900802612, 0.825233519077301, 0.8299004435539246, 0.834437906742096, 0.8388512134552002, 0.843145489692688, 0.847325325012207, 0.8513953685760498, 0.8553597927093506, 0.8592227697372437, 0.8629880547523499, 0.8666592836380005, 0.8702400326728821, 0.8737335801124573, 0.8771430253982544, 0.880471408367157,
        0.8837215304374695, 0.8868961930274963, 0.8899979591369629, 0.8930293321609497, 0.895992636680603, 0.8988901972770691, 0.9017241597175598, 0.9044965505599976, 0.9072093963623047, 0.909864604473114, 0.9124639630317688, 0.9150092005729675, 0.9175020456314087, 0.9199441075325012, 0.9223368167877197, 0.9246817827224731, 0.9269803166389465, 0.9292338490486145, 0.9314436316490173, 0.9336110353469849, 0.935737133026123, 0.9378231763839722, 0.939870297908783, 0.9418795108795166, 0.943851888179779, 0.9457884430885315, 0.9476901888847351, 0.9495579600334167, 0.9513927102088928, 0.9531952738761902, 0.9549665451049805, 0.9567072987556458, 0.9584183692932129, 0.9601004123687744, 0.9617542028427124, 0.9633805155754089, 0.964979887008667, 0.9665531516075134, 0.9681007862091064,
        0.9696235060691833, 0.9711219072341919, 0.9725964665412903, 0.9740478992462158, 0.9754766821861267, 0.9768832921981812, 0.9782682657241821, 0.9796321392059326, 0.980975329875946, 0.9822983741760254, 0.9836016893386841, 0.9848856925964355, 0.986150860786438, 0.9873975515365601, 0.9886261820793152, 0.9898371696472168, 0.9910308122634888, 0.9922075867652893, 0.9933677911758423, 0.9945117831230164, 0.9956399202346802, 0.9967524409294128, 0.9978497624397278, 0.9989321827888489,
    ]); // taken from https://stackoverflow.com/a/52472603
    const hardClipping = new Float32Array([-1, 1]);
    const clipping = initalClipping || softClipping;
    const clippingTypes = ["Soft clipping", "Hard clipping"];

    let module = new Module("distortion", true, false, false, clippingTypes, true);

    module.audioNode = {
        inputNode: audioContext.createGain(),
        biquadNode: audioContext.createBiquadFilter(),
        distortionNode: audioContext.createWaveShaper(),
        outputNode: audioContext.createGain(),
        get gain() {
            return this.inputNode.gain;
        },
        set gain(value) {
            this.inputNode.gain.value = value;
        },
    };

    module.createSlider("gain", gain, 1, 20, 1, "", false, gainInfo);

    module.audioNode.biquadNode.type = "bandpass";
    module.audioNode.biquadNode.frequency.value = 5000;
    module.audioNode.distortionNode.curve = clipping;

    module.audioNode.inputNode.connect(module.audioNode.biquadNode);
    module.audioNode.biquadNode.connect(module.audioNode.distortionNode);
    module.audioNode.distortionNode.connect(module.audioNode.outputNode);

    module.content.options.select.value = clippingTypes[0];

    module.content.options.select.onchange = function () {
        if (this.value === clippingTypes[0]) module.audioNode.distortionNode.curve = clipping;
        else module.audioNode.distortionNode.curve = hardClipping;
    };

    // add inital cable when structure is fully build - getBoundingClientRect related
    module.addInitalCable();
}
