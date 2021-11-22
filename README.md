<p align="center">
    <img src="/img/mobbler_animated.svg" width="300px" />
  </p>
  
  # Introduction
  
  Are you tired of your old and dirty analog music hardware? <br>
  Tired of connecting modular synthesizers with actual PHYSICAL cables? <br>
  Have you always dreamed of creating those mesmerizing berlin-techno hits of the 70's?<br>
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
  
  # Tutorials
  Learn how to recreate some of the modules available in `Effects` menu. 
  
  ## Recreating _Tremolo_ module
Level: Easy
  1. Create one `Gain` module and rename (hover mouse over title for 1.5s) it to `Input & Output`
  2. Create one `Oscillator` module
     - leave `sine` type
     - change `Frequency` value to `3 Hz` 
     - `Frequency` is your `Tremolo`'s `Speed` parameter
  3. Connect them as follows:
     - `Oscillator` with `Input`'s gain parameter
  4. _Tremolo_ module with all its parameters is ready!

![image](https://user-images.githubusercontent.com/1651451/142778723-2331fe88-df70-41ba-8921-ab1e620b8700.png)  
  
  ## Recreating _Reverb_ module
  Level: Medium
   1. Create four `Gain` modules
     - Rename (hover mouse over title for 1.5s) first `Gain` module to `Input`
     - Rename second `Gain` module to `Output`
     - Rename third `Gain` module to `Wetness`
     - Rename fourth `Gain` module to `Dryness`
  2. Create one `Convoler` module
  3. Connect them them as follows:
     - `Input` with `Convoler`
     - `Input` with `Dryness`
     - `Convoler` into `Wetness`
     - `Wetness` with `Output`
     - `Dryness` with `Output`
  4. _Reverb_ module with all its parameters is ready!

![image](https://user-images.githubusercontent.com/1651451/142778335-bd982af1-30de-4c76-a863-79adff1dc675.png)


  ## Recreating _Delay effect_ module
  
  Level: Medium
  
  1. Create four `Gain` modules
     - Rename (hover mouse over title for 1.5s) first `Gain` module to `Input`
     - Rename second `Gain` module to `Output`
     - Rename third `Gain` module to `Wetness`
     - Rename fourth `Gain` module to `Duration`
  2. Create one `Delay` module
  3. Connect them them as follows:
     - `Input` with `Wetness`
     - `Wetness` with `Output`
     - `Input` with `Delay`
     - `Delay` with `Duration`
     - `Duration` with `Delay` (create a loop)
     - `Delay` with `Output`
  4. _Delay effect_ module with all its parameters is ready!
  
> ❗ Watch out not to exceed `Duration`'s gain value over 1.0

  ![image](https://user-images.githubusercontent.com/1651451/142775605-fa720b13-18d5-49f3-b433-ff26aa77f16c.png)
  
  ## Recreating _Flanger_ module
  Level: Hard
  > ❗ Unfortunatelly `flanger`'s parameters are way lower than the minimum's of the basic modules thus it might be really hard to create nice-sounding flanger
  
  1. Create four `Gain` modules
     - Rename (hover mouse over title for 1.5s) first `Gain` module to `Input`
     - Rename second `Gain` module to `Output`
     - Rename third `Gain` module to `Feedback`  
     - Leave fourth `Gain` module with its name
       - `Gain`'s gain is your flanger's `Depth` parameter 
  2. Create one `Delay` module
  3. Create one `Oscillator` module
     - leave `sine` type
     - change `Frequency` value to `0.1 Hz` 
     - `Frequency` is your flanger's `Speed` parameter
  5. Connect them them as follows:
     - `Oscillator` with `Gain`
     - `Gain` with `Delay`'s `Delay time` parameter
     - `Input` with `Output`
     - `Input` with `Delay`
     - `Delay` with `Output`
     - `Delay` with `Feedback`
     - `Feedback` with `Input`
  6. _Flanger_ module with all its parameters is ready!
  
> ❗ Watch out not to exceed:
> - `Gain`'s gain value over 0.1
> - `Feedback`'s gain value over 1
> - `Oscillator`'s frequency value over 1 Hz

![image](https://user-images.githubusercontent.com/1651451/142909373-5df715bf-cad6-404a-92b0-f0c85031e7bf.png) 
  
  # Motive
  <img src="/img/mobbler_word.svg" height="14px"/> is a complex extension of [web audio playground](https://github.com/cwilso/WebAudio). It allows you to explore most of [web audio API](https://www.w3.org/TR/webaudio/) options and play with them in easy to handle visual format. Moreover user can manipulate any module's parameters with other modules thus opening option for custom effects creation without any programming knowledge. Program also contains few popular effects and tutorials on how those could be created from basic modules. It can be used for music creation, education or just for fun. 
  
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
            <li>Output only</li>
          </ul>
        Options:
          <ul>
            <li><b>Source list</b>: Loaded sounds</li>
            <li><b>Loop</b>: Enables sound looping</li>
          </ul>
        Parameters:
          <ul>
            <li><b>Playback rate</b>: Increases the playback rate squeeze the sound wave into a smaller time window, which increases its frequency</li>
          </ul>
      </td>
    </tr>
  </table>
        
  </details>
  
  <details><summary>Oscillator</summary>  
  <table>
    <tr>
      <td>
        <img src="https://user-images.githubusercontent.com/1651451/142731517-2b826777-637e-4695-a4e5-3f4a19e09d7d.png"/>
      </td>
      <td>
        Description:
          <ul>
            <li>Outputs a periodic waveform, such as a sine wave, square, sawtooth or triangle at various frequency</li>
          </ul>
        Input-output type:
          <ul>
            <li>Output only</li>
          </ul>
        Options:
          <ul>
            <li><b>Waves list</b>: Types of periodic wave</li>
          </ul>
        Parameters:
          <ul>
            <li><b>Frequency</b>: Number of complete cycles a waveform makes in a second</li>
            <li><b>Detune</b>: Determine how much signal will be played out of tune</li>
          </ul>
      </td>
    </tr>
  </table>
  </details>
  
  <details><summary>Live input</summary> 
  <table>
    <tr>
      <td>
        <img src=""/>
      </td>
      <td>
        Description:
          <ul>
            <li>Receives signal from microphone</li>
          </ul>
        Input-output type:
          <ul>
            <li>Output only</li>
          </ul>
      </td>
    </tr>
  </table>  
  </details>
  
  ### Basics
  <details><summary>Analyser</summary>
  <table>
    <tr>
      <td>
        <img src="https://user-images.githubusercontent.com/1651451/142767526-7041bfe0-c10e-4865-8956-ddd75c4901e4.png"/>
      </td>
      <td>
        Description:
          <ul>
            <li>Captures audio data in a certain frequency domain and then visualize it in a form of wave or frequency bars</li>
          </ul>
        Input-output type:
          <ul>
            <li>Input & Output</li>
          </ul>
        Options:
          <ul>
            <li><b>Type list</b>: Shows data in sine wave or frequency bars form</li>
          </ul>
      </td>
    </tr>
  </table>
  </details>
  
  <details><summary>Biquad filter</summary>  
  <table>
    <tr>
      <td>
        <img src="https://user-images.githubusercontent.com/1651451/142767534-9a52983d-065b-4eca-bd62-781bf866b7a5.png"/>
      </td>
      <td>
        Description:
          <ul>
            <li>Second order <a href="https://en.wikipedia.org/wiki/Infinite_impulse_response">IIR</a> filter. It is high enough order to be useful on its own, and - because of coefficient sensitivities in higher order filters - the biquad is often used as the basic building block for more complex filters</li>
          </ul>
        Input-output type:
          <ul>
            <li>Input & Output</li>
          </ul>
        Options:
          <ul>
            <li><b>Type list</b>: Filtering algorithm the node is implementing</li>
          </ul>
        As every parameter got different meaning depand on filtering algorithm type check parameters' hint in live version for better description.<br>
        Parameters:
          <ul>
            <li><b>Frequency</b></li>
            <li><b>Detune</b></li>
            <li><b>Q</b></li>
            <li><b>Gain</b></li>
          </ul>
      </td>
    </tr>
  </table>  
    
    
  </details>
  
  <details><summary>Convoler</summary>  
  <table>
    <tr>
      <td>
        <img src="https://user-images.githubusercontent.com/1651451/142767558-ccfc8341-2361-49e8-85f0-3f98ca81feb0.png"/>
      </td>
      <td>
        Description:
          <ul>
            <li>Takes the sonic properties of a real world object (acoustic space, analogue gear etc) and applys those to a given signal to mimic the sound of the original device/space</li>
          </ul>
        Input-output type:
          <ul>
            <li>Input & Output</li>
          </ul>
        Options:
          <ul>
            <li><b><a href="https://en.wikipedia.org/wiki/Impulse_response">IR</a> list</b>: Different types of preloaded IR</li>
            <li><b>Normalizer</b>: Apply a fixed amount of gain to audio so that the highest peak is set at the highest acceptable recording level</li>
          </ul>
      </td>
    </tr>
  </table>   
  </details>
  
  <details><summary>Delay</summary>  
  <table>
    <tr>
      <td>
        <img src="https://user-images.githubusercontent.com/1651451/142767616-34e2f003-697e-470e-ae95-60ef1e7b3a8f.png"/>
      </td>
      <td>
        Description:
          <ul>
            <li>Records audio signal and then reproduces at a time delay</li>
          </ul>
        Input-output type:
          <ul>
            <li>Input & Output</li>
          </ul>
        Parameters:
          <ul>
            <li><b>Delay time</b>: Number of seconds by which the signal will be delayed</li>
          </ul>
      </td>
    </tr>
  </table>  
  
  </details>
  
  <details><summary>Dynamics compressor</summary>  
      <table>
          <tr>
            <td>
              <img src="https://user-images.githubusercontent.com/1651451/142767638-1086e53a-d271-4d82-acfd-0f5d859a6cf6.png"/>
            </td>
            <td>
              Description:
                <ul>
                  <li>Reduces the volume of loud sounds or amplifies quiet sounds, thus reducing or compressing an audio signal's <a href="https://en.wikipedia.org/wiki/Dynamic_range">dynamic range</a></li>
                </ul>
              Input-output type:
                <ul>
                  <li>Input & Output</li>
                </ul>
              Parameters:
                <ul>
                  <li><b>Threshold</b>: The level at which a dynamics processing unit will begin to change the gain of the incoming signal</li>
                  <li><b>Knee</b>: Determines how abruptly or gradually compression begins once the sound level crosses the threshold</li>
                  <li><b>Ratio</b>: The amount of gain reduction. Input level over this amount dB will be reduced by 1dB over the threshold</li>
                  <li><b>Attack</b>: The point where the sound begins and increases in volume to its peak</li>
                  <li><b>Release</b>: The rate at which the volume drops to zero as the sound stops playing</li>
                </ul>
            </td>
          </tr>
        </table>      
  </details>
  
  <details><summary>Gain</summary>  
      <table>
          <tr>
            <td>
              <img src="https://user-images.githubusercontent.com/1651451/142767762-d60a5f4b-9538-4c5e-8963-f6f1b3f09d8b.png"/>
            </td>
            <td>
              Description:
                <ul>
                  <li>Increases in audio signal strength</li>
                </ul>
              Input-output type:
                <ul>
                  <li>Input & Output</li>
                </ul>
              Parameters:
                <ul>
                  <li><b>Gain</b>: Change in volume</li>
                </ul>
            </td>
          </tr>
        </table>  
  
  </details>
  
  ### Effects
  
  <details><summary>Distortion</summary>
      <table>
          <tr>
            <td>
              <img src="https://user-images.githubusercontent.com/1651451/142767851-c7c0d06b-030a-452a-94cc-68b8bcd0ecb7.png"/>
            </td>
            <td>
              Description:
                <ul>
                  <li>Deforms of a waveform at the output creating a distorted or "dirty" signal</li>
                </ul>
              Input-output type:
                <ul>
                  <li>Input & Output</li>
                </ul>
              Options:
                <ul>
                  <li><b>Oversample value</b>: Up-sampling size applied before the distortion effect</li>
                </ul>
            </td>
          </tr>
        </table>    
  </details>
  
  <details><summary>Delay effect</summary>  
      <table>
          <tr>
            <td>
              <img src="https://user-images.githubusercontent.com/1651451/142731530-db56d58f-0e66-4fbb-8f1a-a2674b49f513.png"/>
            </td>
            <td>
              Description:
                <ul>
                  <li>Multi-node effects in which an audio signal is recorded, reproduced at a time delay, then mixed with the original (main different from "Delay" module), non-delayed signal to create a variety of effects</li>
                </ul>
              Input-output type:
                <ul>
                  <li>Input & Output</li>
                </ul>
              Parameters:
                <ul>
                  <li><b>Wetness</b>: Loudness of signal with full amount of an effect</li>
                  <li><b>Delay time</b>: Number of seconds from input signal to be storage and play back</li>
                  <li><b>Feedback</b>: The return of a portion of the output signal back into delay loop</li>
                </ul>
            </td>
          </tr>
        </table>      
  </details>
  
  <details><summary>Flanger</summary>  
  <table>
    <tr>
      <td>
        <img src="https://user-images.githubusercontent.com/1651451/142768176-fde449f4-7a64-468a-9e78-81deb03b6749.png"/>
      </td>
      <td>
        Description:
          <ul>
            <li>Blends the signal with a copy of that signal at a slight time delay, then modifying the delayed copy, creating a "swirling" sound</li>
          </ul>
        Input-output type:
          <ul>
            <li>Input & Output</li>
          </ul>
        Parameters:
          <ul>
            <li><b>Delay time</b>: Number of seconds from input signal to be storage and play back</li>
            <li><b>Depth</b>: Length of the effect</li>
            <li><b>Feedback</b>: The return of a portion of the output signal back into delay loop</li>
            <li><b>Speed</b>: Frequency of oscillator that makes swirling sounds</li>
          </ul>
      </td>
    </tr>
  </table>      
  </details>
  
  <details><summary>Reverb</summary>
      <table>
          <tr>
            <td>
              <img src="https://user-images.githubusercontent.com/1651451/142771125-c2220167-3573-4651-9150-c9ae47a8dee1.png"/>
            </td>
            <td>
              Description:
                <ul>
                  <li>Creates persistence of sound after the sound is produced</li>
                </ul>
              Input-output type:
                <ul>
                  <li>Input & Output</li>
                </ul>
              Options:
                <ul>
                  <li><b><a href="https://en.wikipedia.org/wiki/Impulse_response">IR</a> list</b>: Different types of preloaded IR</li>
                </ul>
              Parameters:
                <ul>
                  <li><b>Dryness</b>: Loudness of signal without any signal processing</li>
                  <li><b>Wetness</b>: Loudness of signal with full amount of an effect</li>
                </ul>
            </td>
          </tr>
        </table>  
    
  </details>
  
  <details><summary>Tremolo</summary>  
      <table>
          <tr>
            <td>
              <img src="https://user-images.githubusercontent.com/1651451/142768515-475357c8-7651-4581-9bae-636e87baba31.png"/>
            </td>
            <td>
              Description:
                <ul>
                  <li>Makes a rapid shift in amplitue thus creating "shaking" musical effect</li>
                </ul>
              Input-output type:
                <ul>
                  <li>Input & Output</li>
                </ul>
              Parameters:
                <ul>
                  <li><b>Speed</b>: Frequency of oscillator that makes trembling effect</li>
                </ul>
            </td>
          </tr>
        </table>      
  </details>
  
  ### Outputs
  <details><summary>Output</summary>
  <table>
      <tr>
        <td>
          <img src="https://user-images.githubusercontent.com/1651451/142771479-6f50d5d8-cd54-4c65-a389-4a47711e25b7.png"/>
        </td>
        <td>
          Description:
            <ul>
              <li>Plays sound out to the speakers. Only one output module per project</li>
            </ul>
          Input-output type:
            <ul>
              <li>Input only</li>
            </ul>
        </td>
      </tr>
    </table>
   
  </details>
  
  <details><summary>Visualisation</summary>
  <table>
      <tr>
        <td>
          <img src="https://user-images.githubusercontent.com/1651451/142768629-57dbc31b-2e6d-451f-b9ef-d433e6a5dd37.png"/>
        </td>
        <td>
          Description:
            <ul>
              <li>Create kaleidoscope-like visualisation controlled by other modules</li>
            </ul>
          Input-output type:
            <ul>
              <li>Input only</li>
            </ul>
          Parameters:
            <ul>
              <li><b>Bar width</b>: </li>
              <li><b>Scale divider</b>: </li>
              <li><b>Symmetries</b>: </li>
              <li><b>Color</b>: </li>
              <li><b>Line width</b>: </li>
              <li><b>Zoom</b>: </li>
            </ul>
        </td>
      </tr>
    </table>
  </details>
  
  # Technology & limitation
  Made in vanilla JavaScript as an learning exercise. <br>
  Due to the mouse-related handlers solution doesn't work properly with touch (mobiles/tablets). <br>
  It was developed for Chrome browser however seems to be working fine on Firefox and Egde too.
    
  
  [![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
  
