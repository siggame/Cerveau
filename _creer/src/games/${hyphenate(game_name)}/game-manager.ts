// This file is where you should put logic to control the game and everything
// around it.<%include file="functions.noCreer" /><%

imports = {
    "./": [ game['name'] + "GameObjectFactory", "BaseClasses", game['name'] + "Game" ],
}

%>
${shared['cerveau']['imports'](imports)}
${merge('// ', 'imports', """// any additional imports you want can be placed here safely between creer runs
""", optional=True, help=False)}

/**
 * Manages the game logic around the ${game_name} Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class ${game['name']}GameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
${merge('            // ', 'aliases', """            \"MegaMinerAI-##-{}\",
""".format(game['name']), optional=True, help=False)}
        ];
    }

    /** The number of players that must connect to play this game */
    public static get requiredNumberOfPlayers(): number {
${merge('        // ', 'required-number-of-players', """        // override this if you want to set a different number of players
        return super.requiredNumberOfPlayers;
""", optional=True, help=False)}
    }

    /** The game this GameManager is managing */
    public readonly game!: ${game['name']}Game;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: ${game['name']}GameObjectFactory;

${merge('    // ', 'public-methods', """
    // any additional public methods you need can be added here

""", optional=True, help=False)}

% if 'TurnBasedGame' in game['serverParentClasses']: #// then they'll probably want these before/after turn methods
    /**
     * This is called BEFORE each player's runTun function is called
     * (including the first turn).
     * This is a good place to get their player ready for their turn.
     */
    protected async beforeTurn(): Promise<void> {
        await super.beforeTurn();

${merge('        // ', 'before-turn', """        // add logic here for before the current player's turn starts
""", optional=True, help=False)}
    }

    /**
     * This is called AFTER each player's turn ends. Before the turn counter
     * increases.
     * This is a good place to end-of-turn effects, and clean up arrays.
     */
    protected async afterTurn(): Promise<void> {
        await super.afterTurn();

${merge('        // ', 'after-turn', """        // add logic here after the current player's turn starts
""", optional=True, help=False)}
    }


    /**
     * Checks if the game is over in between turns.
     * This is invoked AFTER afterTurn() is called, but BEFORE beforeTurn()
     * is called.
     *
     * @returns True if the game is indeed over, otherwise if the game
     * should continue return false.
     */
    protected primaryWinConditionsCheck(): boolean {
${merge('        // ', 'primary-win-conditions', """        // Add logic here checking for the primary win condition(s)
""", optional=True, help=False)}
        return false; // If we get here no one won on this turn.
    }

    /**
     * Called when the game needs to end, but primary game ending conditions
     * are not met (like max turns reached). Use this to check for secondary
     * game win conditions to crown a winner.
     * @param reason The reason why a secondary victory condition is happening
     */
    protected secondaryGameOver(reason: string): void {
${merge('        // ', 'secondary-win-conditions', """        // Add logic here for the secondary win conditions
""", optional=True, help=False)}

        // This will end the game.
        // If no winner it determined above,
        // then a random winner will be chosen.
        super.secondaryGameOver(reason);
    }

%endif
${merge('    // ', 'protected-private-methods', """
    // any additional protected/private methods you need can be added here

""", optional=True, help=False)}
}
