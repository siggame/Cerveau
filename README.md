# Cerveau
The Node.js implementation of a multi-game server intended for games with AIs within the Cadre framework.

![{Cadre}](http://i.imgur.com/17wwI3f.png)

All inspiration taken from [MST's SIG-GAME framework](https://github.com/siggame), and most of the terminology is assuming some familiarity with it as this is a spiritual successor to it.

## Features

* Multi-Game Multi-Framework
  * One server instance can host multiple games at the same time, and the games can be completely different games.
  * e.g. One server could host Chess, Checkers, Go, etc all at the same time and clients can choose which games to play.
* A simple Node.js app: Simple to write, fast to run, and very easy to develop in.
* Easy generation of new games using the [Creer](https://github.com/JacobFischer/Creer) codegen
  * Most of the game code is easy to replace using generatedObjName.js files to ease Creer codegene re-runs.
* Games can be turn based or real time, with turn based code abstracted into an inheritable class.
  * More game prototypes can be added easily as new classes for re-use
* Non-restrictive game structures.
  * Games state can be structured in any way.
  * Cycles can be created and synched easily between the server and its clients.
* All logic is server side (here), with states updating for clients after anything changes.
  * Optional support for client side logic
* Web interface
  * Gamelog viewer with visualizer
  * Automatic general game documentation generation
* A simple Class system that supports multiple inheritance
* Truely multi-threaded. As opposed to using Node's internal thread pool, each game session is spun off to a seperate process to run until the game is complete.
* Networking via TCP
  * Communication via json strings with support for cycles within game references
  * Only deltas in states are send over the network
* Automatic gamelog generation as a json structure of deltas
* Extra fields present for Arena and Data Mining purposes
* Optional authentication with seperate web server for "offical" game matches

## Requirements

Node v6.4.0 is the supported version. may run on older/newer versions, but we do not support them officially.

## How to Run

```
npm install
node ./main.js
```

That's it, your server is running! Now start up two Cadre clients such as the [Python](https://github.com/JacobFischer/Joueur.py) or [JavaScript](https://github.com/JacobFischer/Joueur.js) clients and connect them to the new server. Or visit the server in your webbrowser to view gamelogs and game documentation.

By default games can be played on port 3000, and the website starts on the game port + 80, so 3080 by default.

## How to add games

You could manually code everything, but to more easily sync the game to clients (espcially non-dynamically types ones) use [Creer](https://github.com/JacobFischer/Creer) to generate some base code given the basic game structure.

Then fill in the functions for the functions to you make in your game objects. Everything else should be handled by the base classes in both this server and the clients.

## Debugging

Use [node-inspector](https://github.com/node-inspector/node-inspector), as it's awesome.

The main thread, which runs the website and game Lobby can be debugged as any normal NodeJS app, but game Sessions are run on true seperate threads rather than the Lobby and must be debugged on a different port. By default that port will be: `mainThreadPort + gameSession`. So if the main thread can be debugged on port 5858 (the default node-inspector port), and you want to debug game session 1, it can be debugged on port 5859.
