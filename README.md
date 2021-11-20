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

**Say no more!** Turn those clumsy analog nightmares into modern world luxury browser-based dreamsᵀᴹ.<br>
Introducing <img src="/img/mobbler_word.svg" height="14px"/> - an revolutionary browser tool for analog-like music creation and realtime [visual performance](https://en.wikipedia.org/wiki/VJing)ᵇᵉᵗᵃ.
<div align="center">
<img src="https://user-images.githubusercontent.com/1651451/142727254-c605e95b-abd8-4084-aa79-d2510d038e0b.png" height="300px" />
</div>
  


<div align="center">
  
🎙️ [Play with it now!](https://en.wikipedia.org/wiki/VJing)
  
</div>


# Motive
<img src="/img/mobbler_word.svg" height="14px"/> was build as a complex extension of [Web Audio Playground](https://github.com/cwilso/WebAudio). It allows you to explore most of [web audio API](https://www.w3.org/TR/webaudio/) options and play with them in easy to handle visual format. Moreover user can manipulate any module's parameters with other modules thus opening option for custom effects creation without any programming knowledge. Program also contains few popular effects and tutorials on how those could be created from basic modules. It can be used for music creation, education or just for fun. 

# Modules
Module is a single audio node with/without parameters. Most of modules are input-output enabled thus could be used in a middle connection between other modules. However there are also input-only and output-only modules as well.
| Input-only module  | Input-output module | Output-only module |
| ------------- | ------------- | ------------- |
| ![image](https://user-images.githubusercontent.com/1651451/142722525-0ef51027-109e-4cb4-ae16-235ccc8bf034.png) <br> An "_Output_" module with audio input (on the top left) and without any output cable nor parameters' input  | ![image](https://user-images.githubusercontent.com/1651451/142722506-8853efb0-4426-464b-bb81-5f92bdef9f8e.png) <br> A "_Delay Effect_" module with audio input, output cable (on the right) and three parameter's inputs (_wetness_, _delay time_ and _feedback_ in the bottom) | ![image](https://user-images.githubusercontent.com/1651451/142722517-e0c27f8b-f687-4dd3-a851-cc6d03cb6994.png) <br> An "_Oscillator_" module without audio input and with output cable and two parameter's input (_frequency_ and _detune_) |
## Types
### Inputs:
<details><summary>audio source</summary></details>
<details><summary>oscillator</summary></details>
<details><summary>live input</summary></details>

### Basics
<details><summary>analyser</summary></details>
<details><summary>biquad filter</summary></details>
<details><summary>convoler</summary></details>
<details><summary>delay</summary></details>
<details><summary>dynamics compressor</summary></details>
<details><summary>gain</summary></details>

### Effects
<details><summary>distortion</summary></details>
<details><summary>delay effect</summary></details>
<details><summary>flanger</summary></details>
<details><summary>reverb</summary></details>
<details><summary>tremolo</summary></details>

### Output
Only one per project
### Visualisation
Create kaleidoscope-like visualisation controlled by other modules.

Vanilla JS. 

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
