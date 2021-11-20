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
### Inputs:
<details><summary>Audio source</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| ![image](https://user-images.githubusercontent.com/1651451/142734061-f2f0391c-80cd-4536-8c9c-25a873a0f1c8.png) | Play any modern audio file or choose from already provided | Output only | **Loop**: enable sound looping <br> **Source**: loaded sounds | **Playback rate**: increase the playback rate squeeze the sound wave into a smaller time window, which increases its frequency |
    
</details>
<details><summary>Oscillator</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| ![image](https://user-images.githubusercontent.com/1651451/142731517-2b826777-637e-4695-a4e5-3f4a19e09d7d.png) | Outputs a periodic waveform, such as a sine wave | Output only | **Wave**: types of periodic wave | **Frequency**: Number of complete cycles a waveform makes in a second <br> **Detune**: Determine how much signal will be played out of tune |     
</details>
<details><summary>Live input</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |     
</details>

### Basics
<details><summary>Analyser</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |    
</details>
<details><summary>Biquad filter</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |    
</details>
<details><summary>Convoler</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |   
</details>
<details><summary>Delay</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |     
</details>
<details><summary>Dynamics compressor</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |    
</details>
<details><summary>Gain</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |     
</details>

### Effects
<details><summary>Distortion</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |   
</details>
<details><summary>Delay effect</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | | 
</details>
<details><summary>Flanger</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |     
</details>
<details><summary>Reverb</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |     
</details>
<details><summary>Tremolo</summary>
  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |     
</details>

### Output
Only one module per project.

  
| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |
### Visualisation
Create kaleidoscope-like visualisation controlled by other modules.

| Image | Description | I/O type | Options | Parameters |   
| ------------- | ------------- | ------------- | ------------- | ------------- |
| | | |


# Technology & limitation
Made in vanilla JavaScript as an learning exercise. Due to its nature and complexity solution doesn't work properly on mobile device. <br>
It was developed for Chrome browser however seems to be working fine on Firefox and Egde too.  

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
