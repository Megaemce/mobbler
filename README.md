<p align="center">
  <img src="https://github.com/Megaemce/mobbler/blob/main/img/mobbler.svg" width="300px" />
</p>

# Introduction
Mobbler is an open source browser tool for analog-like music creation and realtime [visual performance](https://en.wikipedia.org/wiki/VJing)ᵇᵉᵗᵃ.

>   <i>Turn your old clumsy analog nightmare into modern-world luxury browser-based dreamᵀᴹ</i>


<p align="center">
  <img src="https://live.staticflickr.com/7622/17016562038_748ce7f2a4_o.jpg" height="300px" />
  <img src="https://user-images.githubusercontent.com/1651451/142723543-7d896885-5441-489a-9774-fe7386e0e4a9.png" height="300px" />
</p>


# Motive
It was build as a complex extension of [Web Audio Playground](https://github.com/cwilso/WebAudio). Mobbler allows you to explore most of [web audio API](https://www.w3.org/TR/webaudio/) options and play with them in easy to handle visual format. In mobbler user can manipulate any module's parameters with other modules thus opening option for custom effects creation without any programming knowledge. Program itself already contains few popular effects and tutorials on how those could be created from basic modules. It can be used for music creation, education or just for fun. 

# Modules
Module is a single audio node with/without parameters. Most of modules are input-output enabled thus could be used in a middle connection between other modules. However there are also input-only and output-only modules as well.
| Input-only module  | Input-output module | Output-only module |
| ------------- | ------------- | ------------- |
| ![image](https://user-images.githubusercontent.com/1651451/142722525-0ef51027-109e-4cb4-ae16-235ccc8bf034.png) <br> An "_Output_" module with audio input (on the top left) and without any output cable nor parameters' input  | ![image](https://user-images.githubusercontent.com/1651451/142722506-8853efb0-4426-464b-bb81-5f92bdef9f8e.png) <br> A "_Delay Effect_" module with audio input, output cable (on the right) and three parameter's inputs (_wetness_, _delay time_ and _feedback_ in the bottom) | ![image](https://user-images.githubusercontent.com/1651451/142722517-e0c27f8b-f687-4dd3-a851-cc6d03cb6994.png) <br> An "_Oscillator_" module without audio input and with output cable and two parameter's input (_frequency_ and _detune_) |
## Types
### Inputs:
- any modern music format file
- live input
- oscillator

### Basics
- visual analyzer
- biquad filter
- convoler
- delay
- dynamics compressor
- gain

### Effects
- distortion
- delay effect
- flanger
- reverb
- tremolo

### Output

From VJ point of view:
- create kaleidoscope-like visualisation

Vanilla JS. 

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
