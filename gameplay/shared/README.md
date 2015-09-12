# /games/shared/

This folder is where you can predefine gameplay logic that is shared between games in the `games/` folder.

For example, turn based games are very common in AI vs AI games. In SIG-GAME the code gen automatically copied a bunch of turn based code between runs, which isn't DRY. Instead with Cerveau we abstract as much of that logic as possible into `./turnBaseGame.js`, so any Game that inherits from TurnBasedGame will get that turn based logic added, and we arn't duplicating code.

tl;dr: To keep game logic DRY, put shared code here.
