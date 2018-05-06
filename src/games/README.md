# games/

This directory should never be added to directly.
Instead [Creer](https://github.com/JacobFischer/Creer) will create the basics
of a game in its appropriate directory here, along-side all expected files.

In additiom, when editing games, if you are duplicating code between them,
consider moving that logic to a mixin via `/core/game/mixins/`, as it's
probably shared gameplay logic.

`TurnBasedGame` is a good example of not duplicating turn based game code, that
basically all games need regardless.
