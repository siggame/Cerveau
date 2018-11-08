# Cerveau

The Node.js implementation of a multi-game server intended for games with
AIs within the [Cadre][cadre] framework using [TypeScript][ts].

![{Cadre}](http://i.imgur.com/17wwI3f.png)

All inspiration taken from [MST's SIG-GAME framework][siggame],
and most of the terminology is assuming some familiarity with it as this is a
spiritual successor to it.

## Features

* Multi-Game Multi-Framework
  * One server instance can host multiple games at the same time,
    and the games can be completely different games.
  * e.g. One server could host Chess, Checkers, Go, etc all at the same time
    and clients can choose which games to play.
* A simple Node.js app: Simple to write, fast to run, and very easy to
  develop in.
* Easy generation of new games using the [Creer][creer] codegen.
  * Most of the game code is easy to replace using generatedObjName.js files to
    ease Creer codegen re-runs.
* Games can be turn based or real time, with turn based code abstracted into an
  inheritable class.
  * More game prototypes can be added easily as new classes for re-use
* Non-restrictive game structures.
  * Games state can be structured in any way.
  * Cycles can be created and synched easily between the server and its
    clients.
* All logic is server side (here), with states updating for clients after
  anything changes.
  * Optional support for client side logic
    (though this is generally frowned upon).
* Web interface to check on gamelogs and server status.
* Leverages TypeScript for type safety and eases developer on-boarding.
* Latest ES features by keeping up to date with Node.js releases.
* Truly multi-threaded. As opposed to using Node's internal thread pool,
  each game session is spun off to a separate process to run until the game is
  complete.
* Networking via TCP
  * Communication via json strings with support for cycles within game
    references.
  * Only deltas in states are send over the network.
* Automatic gamelog generation as a json structure of deltas
* Extra fields present for Arena and Data Mining purposes
* Optional authentication with separate web server for "official" game matches.

## Developing

Developing is super easy, especially if you just want to code games.

We recommend using [Visual Studio Code][vsc] as your IDE with the
[tslint][tslint] plugin. It comes with everything you need to build, run, and
debug the game server.

After that you don't need much knowledge of JS/TS. Visual Studio code, and the
linter (tslint) will yell at you, and suggest code, to help guide you. Most
game logic can be written by students new to programming, as 99% of the
heavy lifting is handled by the core of this project.

Otherwise this is a Node.js + TypeScript project. If you want to use your own
custom environment you should understand how to build and run TypeScript
projects.

### Requirements

Node v9 is the supported version. It may run on older/newer versions,
(epically if you babel it), but we do not support them officially.

## How to Run

``` bash
npm install
npm start
```

That's it, your server is running! Now start up two Cadre clients such as the
[Python][joueur.py] and the [JavaScript][joueur.js] clients and connect them to
the new server. Or visit the server in your web-browser to view gamelogs and
the status of the game server.

By default games can be played on port 3000, and the website starts on the game
port + 80, so 3080 by default. Websocket clients on port 3088.

### Faster development

By default, using `npm start` has a long startup time as each file has to be
transpiled by TypeScript before being ran. If you are actively developing a
game your best workflow will be to open two terminals (split view in VSC):

#### First Terminal = Watcher

This will watch for code changes, and re-compile them to JS when a file
changes.

```bash
npm run build:watch
```

#### Second Terminal = Run Transpiled Code

```bash
npm run js
```

With these two terminals up are you good to go! Because by default games are
multi-threaded, if you make a change to a file, the next time you play that
game the new code will run. You don't have to tear down the `npm run js`
process!

## How to add games

Use [Creer][creer] to generate some base code given the basic game structure.

Then fill in the functions for the functions to you make in your game objects.
Everything else should be handled by the base classes in both this server and
the clients.

### Implementing game logic

Once you've generated a game, and generated its files via Creer, and bunch of
files will be generated that need **you** to add logic to.

So for example, if you have a `Unit` class with a `move(tile)` function, you'd
go to `src/games/game-name/unit.ts`.

Then you'd look for two functions: `invalidateMove()` and `move()`.

In the invalidate function, examine each argument and the game state to try
to find a reason why the passed in arguments are invalid. If you can find a
reason (such as `tile === undefined`), return a string explaining to the
coder why we couldn't run their function.

Then fill out the actual game logic in the `move()` function. That only gets
called if the invalidate function doesn't return an error string. So you can
safely assume if it is invoked, everything is ok.

Other than that, the `game.ts`, `game-manager.ts`, and `game-settings.ts` files
need to be filled out as well.

`game.ts` should initialize the game, which probably means map generation
and randomization.

`game-manager.ts` "glues" everything together. It manages the game, and
everything in it. So that is where you should code in-between turn logic,
creating new things, checking for game over, etc.

`game-settings.ts` is optional, however it exposes variables coders can tweak
to customize they game they are playing. This is useful for them to debug,
and for you to work faster as you can send constants to the game server to
balance games faster (like a unit damage setting).

## Debugging

We've included a debugging profile for [Visual Studio Code][vsc] that
requires no additional configuration. Just open this project in VSC, and hit
"Start Debugging" (F5 by default).

VSC will hook into this using the v8 debugger, and you can place breakpoints
anywhere to see what is happening. A bunch of settings are enabled/disabled
to make debugging easier, like not timing out clients so you can poke around
in paused code for long periods of time without killing clients.

[vsc]: https://code.visualstudio.com/
[ts]: https://www.typescriptlang.org/
[tslint]: https://marketplace.visualstudio.com/items?itemName=eg2.tslint
[siggame]: https://github.com/siggame
[cadre]: https://github.com/siggame/Cadre
[creer]: https://github.com/siggame/Creer
[joueur.py]: https://github.com/siggame/Joueur.py
[joueur.js]: https://github.com/siggame/Joueur.js
