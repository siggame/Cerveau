# games/

This directory should never be added to directly. Instead [Creer](https://github.com/JacobFischer/Creer) will create the basics of a game in it's appropriate directory here.

Also when editing games, if you are duplicating code between them, consider moving that logic to `/gameplay/shared/`, as it's probably shared gameplay logic. `TurnBasedGame` is a good example of not duplicating turn based game code.
