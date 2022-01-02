<span align="center">
<a hred="https://mobbler.js.org">

![GitHub Light](/img/mobbler_animated.svg#gh-light-mode-only)
![GitHub Dark](/img/mobbler_animated_dark.svg#gh-dark-mode-only)

 </a>
</span>

## Introduction

Are you tired of your old and dirty analog music hardware? <br>
Tired of connecting modular synthesizers with actual PHYSICAL cables? <br>
Have you always dreamed of creating those mesmerizing berlin-techno hits of the 70's?<br>
<div align="center">
 <img src="https://i.imgur.com/uripicq.jpg" height="250px"/>
 <img src="https://user-images.githubusercontent.com/1651451/147878175-7902a9ee-92ec-47f4-a4e9-f120ecdeb7dc.png" height="250px"/>
</div>
<br/>

**Say no more!** Turn those clumsy analog nightmares into modern world browser-based dreamsᵀᴹ.<br>
Introducing <a href="https://mobbler.js.org"><img src="/img/mobbler_word.svg" height="14px"/></a> - an revolutionary browser tool for analog-like music creation and realtime [visual performance](https://en.wikipedia.org/wiki/VJing)ᵇᵉᵗᵃ.
<div align="center">
<img src="https://user-images.githubusercontent.com/1651451/142727254-c605e95b-abd8-4084-aa79-d2510d038e0b.png" height="300px" />
</div>
<BR>
<div align="center">
 
 🎙️ <b>[TRY IT!](https://mobbler.js.org)</b>

</div>

## Motive
<a href="https://mobbler.js.org"><img src="/img/mobbler_word.svg" height="14px"/></a> is a complex extension of [web audio playground](https://github.com/cwilso/WebAudio). It allows you to explore most of [web audio API](https://www.w3.org/TR/webaudio/) options and play with them in easy to handle visual format. Moreover user can manipulate any module's parameters with other modules thus opening option for custom effects creation without any programming knowledge. Program contains few [popular effects](https://github.com/Megaemce/mobbler/wiki/Effects) and [tutorials](https://github.com/Megaemce/mobbler/wiki/Tutorials) on how those could be created from basic modules. It can be used for music creation, education or just for fun. 

Implemented modules:
<table>
<thead>
  <tr>
    <th>Inputs</th>
    <th>Bascis</th>
    <th>Effects</th>
    <th>Outputs</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>
     <ul>
      <li>Audio source</li>
      <li>Constant offset</li>
      <li>Oscillator</li>
      <li>Pulse oscillator</li>
      <li>Live input</li>
     </ul>
   </td>
    <td>
     <ul>
      <li>Biquad filter</li>
      <li>Convoler</li>
      <li>Crossfade</li>
      <li>Delay</li>
      <li>Dynamic compresssor</li>
      <li>Envelope</li>
      <li>Equalizer</li>
      <li>Gain</li>
      <li>Stereo panner</li>
     </ul>
   </td>
    <td>
     <ul>
      <li>Chorus</li>
      <li>Distortion</li>
      <li>Delay</li>
      <li>Flanger</li>
      <li>Reverb</li>
      <li>Tremolo (Gain)</li>
      <li>Tremolo (Panner)</li>
      <li>Vibrato</li>
      <li>WahWah</li>
     </ul>   
   </td>
       <td>
     <ul>
      <li>Analyser</li>
      <li>Output</li>
      <li>Visualisation</li>
     </ul>   
   </td>
  </tr>
</tbody>
</table>


## How to start
Simply create Audio source module (from `Inputs` menu) and Output (from `Outputs` menu) and connect them with a Audio source cable. Hit the play button 

<div align="center">
 
![Audio source to output connection](https://user-images.githubusercontent.com/1651451/144228280-6568e761-79db-43ba-b518-28597ff0b8c8.png)
 </div>

For more specific modules details and tutorials please check **[mobbler's WIKI](https://github.com/Megaemce/mobbler/wiki)**

## Technology & limitation
Made in vanilla JavaScript as my first big project to get thorough knowledge of this language.<br>
Due to the mouse-related handlers solution doesn't work properly with touch (mobiles/tablets). <br>
It was developed for Chrome browser however seems to be working fine on Firefox and Egde too.


I would never create this solution without the help of these people:
- [Matt McKegg](https://github.com/mmckegg) - author of amazing [web-audio-school](http://mmckegg.github.io/web-audio-school/)
- [Chris Wilson](https://github.com/cwilso) - webAPI guru. Creator of the original idea
- [Chris Lowis](https://github.com/chrislo) - amazing tutorials (just [one example](https://blog.chrislowis.co.uk/2013/06/17/synthesis-web-audio-api-envelopes.html))
- [Sam Bellen](https://github.com/Sambego) - role model for proper multiAudioNode handling and one of the first who started the fire
- [Oskar Eriksson](https://github.com/Theodeus) - creator of Tuna.js
- [Tero Parviainen](https://github.com/teropa) - creator of amazing webAudioAPI [tutorials](https://teropa.info/blog/2016/08/19/what-is-the-web-audio-api.html)
 
**Thank you 👋**

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
