# Cerveau
The Node.js implementation of a multi-game server intended for games with AIs within the Cadre framework.

![{Cadre}](http://i.imgur.com/17wwI3f.png)

All inspiration taken from [MS&T's SIG-GAME framework](https://github.com/siggame), and most of the terminology is assuming some familiarity with it as this is a spiritual successor to it.

## Features

* Multi-Game Multi-Framework
  * One server instance can host multiple games at the same time, and the games can be completely different games.
  * e.g. One server could host Chess, Checkers, Go, etc all at the same time and clients can choose which games to play.
* A simple Node.js app: Simple to write, fast to run, and very easy to develop in.
* Easy generation of new games using the [Creer](https://github.com/JacobFischer/Creer) codegen
  * Most of the game code is easy to replace using generatedObjName.js files to ease Creer codegene re-runs.
* Games can be turn based or real time, with turn based code abstracted into an inheritable class.
  * More game prototypes can be added easily as new classes for re-use
* All logic is server side (here), with states updating for clients after anything changes.
* Web interface
  * Gamelog viewer with visualizer for all games
  * Automatic general game documentation generation
* A simple Class system that supports multiple inheritance
* Networking via Socket IO
  * Communication via json strings with support for cycles within game references
  * Only deltas in states are send over the network
* Automatic gamelog generation as a json structure of deltas
* Extra fields present for Arena and Data Mining purposes


## How to Run

Make sure Node.js is installed then:

```
npm install
node index.js
```

That's it, your server is running! Now start up two Cadre clients such as the [Python](https://github.com/JacobFischer/Joueur.py) or [JavaScript](https://github.com/JacobFischer/Joueur.js) clients and connect them to the new server. Or visit the server in your webbrowser to view gamelogs and game documentation.


## How to add games

You could manually code everything, but to more easily sync the game to clients (espcially non-dynamically types ones) use [Creer](https://github.com/JacobFischer/Creer) to generate some base code given the basic game structure.

Then fill in the functions for the functions to you make in your game objects. Everything else should be handled by the base classes in both this server and the clients.


## Other notes

This is a polished proof-of-concept part of the Cadre framework. There are plently of bugs and issues present. The purpose at this time is not to be perfect, but to show that this framework is robust and meets all the needs of MS&T's ACM SIG-GAME.
