# Legatofy: Automatic Legato Player Interface for Pianists

## Introduction
This repository includes the core of Legatofy interface.
It was developed for the master thesis at Universitat Pompeu Fabra in 2018.

## Requirements
* Ableton Live with Max for Live (tested on 10)
* IRCAM R-IoT (Bitalino), or any 3D acceleration sensors that can send data over UDP in OSC protocol.
* MuBu library for Max (available with a Max/MSP package manager).
* The MIDI keyboard that can communicate with Ableton
* Wireless Router

## Structure
* `legato_player.amxd`: this file is a Max for Live patch which will be loaded by Ableton Live
* `linear_regression.js`: the legato_player patch will load this javascript for linear regression. The javascript is written specifically for Max/MSP, and thus it is not compatible with a general web browser.
* `trained_model.json`: The legato detection model trained with the HHMM (hierarchical hidden Markov model) from the MuBu library. It was trained with author's hand motions.

## How to Run
1. `legato_player.amxd` and `linear_regression.js` must be placed in a directory: `Ableton/User Library/Presets/MIDI Effects`. The location of the Ableton folder may differ for users.
2. Max for Live should have the MuBu library installed through a package manager.
3. Start Ableton Live and connect it with the MIDI keyboard.
4. Ableton Live requires one track of Grand Piano. Add a legato_player MIDI effect onto the Grand Piano track.
5. Connect all IRCAM R-IoT sensors through a router, and check if the histogram on the MIDI effect panel shows any movements. (Refer to the IRCAM R-IoT website about the set up of a router and UDP connection)
6. The trained model has to be imported. Press the button `import_model` and load `trained_model.json`.
7. Everything is set up. Press toggle `enable_legatofy` to use the system.

## How to Use
The information panel of Max for Live shows what's happening while using the interface. The histogram shows jerky movements of a hand in three dimensions. The legato message shows whether the current motion is considered legato or not. The legatofy is only active when the legato is true. The `reset` button serves to wipe out the "legatofied" trend, and calculates it again from the blank.

## Note
The legatofy uses linear regression to determine whether a played MIDI velocity is a mistake or not. This might not be flexible enough when changing a velocity in a large scale suddenly. As a workaround, `reset` button will discontinue this behavior. This issue will be improved in a next version

## Questions / Issues
Please open a new issue, and I'll answer you as much as I can.
