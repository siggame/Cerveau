# core/game/

This directory is where you can pre-define gameplay logic that is shared
between games in the `games/` folder.

For example, turn based games are very common in AI vs AI games.
In SIG-GAME the code gen automatically copied a bunch of turn based code
between runs, which isn't DRY. Instead with Cerveau we abstract as much of that
logic as possible into a mixin, so any Game that inherits from TurnBasedGame
will get that turn based logic added, and we aren't duplicating code.

**tl;dr** - To keep game logic DRY, put shared code here.
