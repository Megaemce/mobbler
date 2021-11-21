<p align="center">
  <img src="/img/mobbler_animated.svg" width="300px" />
</p>

# Introduction

Are you tired of your old and dirty analog music hardware? <br>
Tired of connecting modular synthesizers with actual cables? <br>
Tired of acting like we are still in 60s?<br>
<div align="center">
 <img src="https://i.imgur.com/uripicq.jpg" height="250px"/>
  
 <img src="https://user-images.githubusercontent.com/1651451/142727918-165abe31-0d78-4c62-9a68-370ad509c238.png" height="250px"/>
</div>
<br/>

**Say no more!** Turn those clumsy analog nightmares into modern world browser-based dreamsᵀᴹ.<br>
Introducing <img src="/img/mobbler_word.svg" height="14px"/> - an revolutionary browser tool for analog-like music creation and realtime [visual performance](https://en.wikipedia.org/wiki/VJing)ᵇᵉᵗᵃ.
<div align="center">
<img src="https://user-images.githubusercontent.com/1651451/142727254-c605e95b-abd8-4084-aa79-d2510d038e0b.png" height="300px" />
</div>
  


<div align="center">
  
🎙️ **[Play with it now!](https://en.wikipedia.org/wiki/VJing)**
  
</div>

# Motive
<img src="/img/mobbler_word.svg" height="14px"/> was build as a complex extension of [web audio playground](https://github.com/cwilso/WebAudio). It allows you to explore most of [web audio API](https://www.w3.org/TR/webaudio/) options and play with them in easy to handle visual format. Moreover user can manipulate any module's parameters with other modules thus opening option for custom effects creation without any programming knowledge. Program also contains few popular effects and tutorials on how those could be created from basic modules. It can be used for music creation, education or just for fun. 

# Modules
Module is a single audio node with/without parameters. Most of modules are input-output enabled thus could be used in a middle connection between other modules. However there are also input-only and output-only modules as well.

| Input-only module  | Input-output module | Output-only module |
| ------------- | ------------- | ------------- |
| <p align="center"><img src="https://user-images.githubusercontent.com/1651451/142731494-aaa5d07e-0ce8-4fae-9fa1-a3a4d31a5829.png" width="125px"/></p> | <p align="center"><img src="https://user-images.githubusercontent.com/1651451/142731530-db56d58f-0e66-4fbb-8f1a-a2674b49f513.png" width="310px"/></p> | <p align="center"><img src="https://user-images.githubusercontent.com/1651451/142731517-2b826777-637e-4695-a4e5-3f4a19e09d7d.png" width="300px"></p>|
| "_Output_" module with audio input (on the top left) and without any output cable nor parameters' input | "_Delay Effect_" module with audio input, output cable (on the right) and three parameter's inputs (_wetness_, _delay time_ and _feedback_ in the bottom) | "_Oscillator_" module without audio input and with output cable and two parameter's input (_frequency_ and _detune_) |

## Types
### Inputs
<details><summary>Audio sources</summary>
<table>
  <tr>
    <td>
      <img src="https://user-images.githubusercontent.com/1651451/142734061-f2f0391c-80cd-4536-8c9c-25a873a0f1c8.png"/>
    </td>
    <td>
      Description:
        <ul>
          <li>Play any modern audio file or choose from already provided list</li>
        </ul>
      Input-output type:
        <ul>
          <li>Output</li>
        </ul>
      Options:
        <ul>
          <li><b>Loop</b>: enable sound looping</li>
          <li><b>Source</b>: list of loaded sounds</li>
        </ul>
      Parameters:
        <ul>
          <li><b>Playback rate</b>: increase the playback rate squeeze the sound wave into a smaller time window, which increases its frequency</li>
        </ul>
    </td>
  </tr>
</table>
    
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
|  | Play any modern audio file or choose from already provided list | ♂️ | **Loop**: enable sound looping <br> **Source**: list of loaded sounds | **Playback rate**: increase the playback rate squeeze the sound wave into a smaller time window, which increases its frequency |
  
</details>

<details><summary>Oscillator</summary>  
  
![image](https://user-images.githubusercontent.com/1651451/142731517-2b826777-637e-4695-a4e5-3f4a19e09d7d.png)
  
| Description | I/O type | Options | Parameters |   
| - | :-: | - | - |
 | Outputs a periodic waveform, such as a sine wave, square, sawtooth or triangle at various frequency | ♂️ | **Wave**: types of periodic wave | **Frequency**: Number of complete cycles a waveform makes in a second <br> **Detune**: Determine how much signal will be played out of tune |     
  
</details>

<details><summary>Live input</summary> 
  
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| | Receives signal from microphone | ♂️ | - | - |   
  
</details>

### Basics
<details><summary>Analyser</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| ![image](https://user-images.githubusercontent.com/1651451/142767526-7041bfe0-c10e-4865-8956-ddd75c4901e4.png)
 | Captures audio data in a certain frequency domain and then visualize it in a form of wave or frequency bars | ⚥ | **Type**: show data in sine wave or frequency bars form | - |   
  
</details>

<details><summary>Biquad filter</summary>  
  
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| ![image](https://user-images.githubusercontent.com/1651451/142767534-9a52983d-065b-4eca-bd62-781bf866b7a5.png)
 | Second order [IIR](https://en.wikipedia.org/wiki/Infinite_impulse_response) filter. It is high enough order to be useful on its own, and - because of coefficient sensitivities in higher order filters - the biquad is often used as the basic building block for more complex filters[^biquad] | ⚥ | **Type**: filtering algorithm the node is implementing | **Frequency** <br> **Detune** <br> **Q** <br> **Gain**. <br> As every parameter got different meaning depand on filtering algorithm type check parameters' hint in live version for better description.
  
[^biquad]: [Biquads](https://www.earlevel.com/main/2003/02/28/biquads)
  
</details>

<details><summary>Convoler</summary>  
  
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| ![image](https://user-images.githubusercontent.com/1651451/142767558-ccfc8341-2361-49e8-85f0-3f98ca81feb0.png)
 | Takes the sonic properties of a real world object (acoustic space, analogue gear etc) and applys those to a given signal to mimic the sound of the original device/space.[^1] | ⚥ | **[IR](https://en.wikipedia.org/wiki/Impulse_response)**: different types of preloaded IR <br> **Normalizer**: Apply a fixed amount of gain to audio so that the highest peak is set at the highest acceptable recording level.[^norm] | - |    
  
[^1]: [What is a convolver in mixing and mastering music?](https://www.quora.com/What-is-a-convolver-in-mixing-and-mastering-music/answer/Christopher-Carvalho-2)
[^norm]: https://www.recordingconnection.com/glossary/n  
</details>

<details><summary>Delay</summary>  
  
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| ![image](https://user-images.githubusercontent.com/1651451/142767616-34e2f003-697e-470e-ae95-60ef1e7b3a8f.png)
 | Audio signal is recorded and then reproduced at a time delay | ⚥	| - | **Delay time**: number of seconds by which the signal will be delayed |

</details>

<details><summary>Dynamics compressor</summary>  
  
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| ![image](https://user-images.githubusercontent.com/1651451/142767638-1086e53a-d271-4d82-acfd-0f5d859a6cf6.png)
 | Reduces the volume of loud sounds or amplifies quiet sounds, thus reducing or compressing an audio signal's [dynamic range](https://en.wikipedia.org/wiki/Dynamic_range)[^dyna] | ⚥ | - | **Threshold**: The level at which a dynamics processing unit will begin to change the gain of the incoming signal<br> **Knee**: Determines how abruptly or gradually compression begins once the sound level crosses the threshold<br> **Ratio**: The amount of gain reduction. Input level over this amount dB will be reduced by 1dB over the threshold<br> **Attack**: The point where the sound begins and increases in volume to its peak<br> **Release**: The rate at which the volume drops to zero as the sound stops playing|

[^dyna]: [Dynamic range compression](https://en.wikipedia.org/wiki/Dynamic_range_compression)
  
</details>

<details><summary>Gain</summary>  
  
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| ![image](https://user-images.githubusercontent.com/1651451/142767762-d60a5f4b-9538-4c5e-8963-f6f1b3f09d8b.png)
 | Increases in audio signal strength | ⚥ | - | **Gain**: change in volume |     

</details>

### Effects
<details><summary>Distortion</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| ![image](https://user-images.githubusercontent.com/1651451/142767851-c7c0d06b-030a-452a-94cc-68b8bcd0ecb7.png)
 | Deforms of a waveform at the output creating a distorted or "dirty" signal[^dist] | ⚥ | **Oversample value** - technique for creating more samples (up-sampling) before applying the distortion effect[^over] | - |   

[^dist]: https://www.recordingconnection.com/glossary/d   
[^over]: https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode/oversample

</details>

<details><summary>Delay effect</summary>  
  
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| ![image](https://user-images.githubusercontent.com/1651451/142731530-db56d58f-0e66-4fbb-8f1a-a2674b49f513.png) | Multi-node effects in which an audio signal is recorded, reproduced at a time delay, then mixed with the original (main different from "Delay" module), non-delayed signal to create a variety of effects[^delay] | ⚥ | - | **** - <br> **** - <br> **** -  |

[^delay]: https://www.recordingconnection.com/glossary/d
  
</details>

<details><summary>Flanger</summary>  
  
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| ![image](https://user-images.githubusercontent.com/1651451/142768176-fde449f4-7a64-468a-9e78-81deb03b6749.png) | Blends the signal with a copy of that signal at a slight time delay, then modifying the delayed copy, creating a "swirling" sound[^flan] | ⚥ | - | **Delay time** - Number of seconds from input signal to be storage and play back <br> **Depth** - Length of the effect<br> **Feedback** - The return of a portion of the output signal back into delay loop <br> **Speed** - Frequency of oscillator that makes swirling sounds |

[^flan]: https://www.recordingconnection.com/glossary/f
  
</details>

<details><summary>Reverb</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| | Creates persistence of sound after the sound is produced[^rev] | ⚥ | **[IR](https://en.wikipedia.org/wiki/Impulse_response) list** - different types of preloaded IR | **Dryness** - Loudness of signal without any signal processing<br> **Wetness** - Loudness of signal with full amount of an effect  |

[^rev]: https://en.wikipedia.org/wiki/Reverberation  
  
</details>

<details><summary>Tremolo</summary>  
  
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| ![image](https://user-images.githubusercontent.com/1651451/142768515-475357c8-7651-4581-9bae-636e87baba31.png) | Makes a rapid shift in amplitue thus creating "shaking" musical effect[^tre]  | ⚥ | - | **Speed** - Frequency of oscillator that makes trembling effect  |

[^tre]: https://www.recordingconnection.com/glossary/t
  
</details>

### Output
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| ![image](https://user-images.githubusercontent.com/1651451/142731494-aaa5d07e-0ce8-4fae-9fa1-a3a4d31a5829.png) | Plays sound out to the speakers. Only one output module per project | ♀️ | - | - |

### Visualisation
| Image | Description | I/O type | Options | Parameters |   
| - | - | :-: | - | - |
| ![image](https://user-images.githubusercontent.com/1651451/142768629-57dbc31b-2e6d-451f-b9ef-d433e6a5dd37.png)
 | Create kaleidoscope-like visualisation controlled by other modules. | ♀️ | - | **Bar width** - <br> **Scale divider** - <br> **Symmetries** - <br> **Color** - <br> **Line width** - <br> **Zoom** - |


# Technology & limitation
Made in vanilla JavaScript as an learning exercise. <br>
Due to the mouse-related handlers solution doesn't work properly with touch (mobiles/tablets). <br>
It was developed for Chrome browser however seems to be working fine on Firefox and Egde too.
  

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
