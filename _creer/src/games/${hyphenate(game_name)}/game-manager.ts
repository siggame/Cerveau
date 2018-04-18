// This file is where you should put logic to control the game and everything
// around it.<%include file="functions.noCreer" /><%

imports = {
    "./": [ game['name'] + "GameObjectFactory", "BaseClasses", game['name'] + "Game" ],
}

%>
${shared['cerveau']['imports'](imports)}
${merge('// ', 'imports', """// any additional imports you want can be placed here safely between creer runs
""", optional=True, help=False)}

export class ${game['name']}GameManager extends BaseClasses.GameManager {
    /** The name of this game (used as an ID internally) */
    public static get gameName(): string {
        return "${game['name']}";
    }

    /** The number of players that must connect to play this game */
    public static get requiredNumberOfPlayers(): number {
${merge('        // ', 'required-number-of-players', """        // override this if you want to set a different number of players
        return super.requiredNumberOfPlayers;
""", optional=True, help=False)}
    }

    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
${merge('            // ', 'aliases', """            \"MegaMinerAI-##-{}\",
""".format(game['name']), optional=True, help=False)}
        ];
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
        super.beforeTurn();

${merge('        // ', 'before-turn', """        // add logic here for before the current player's turn starts
""", optional=True, help=False)}
    }

    /**
     * This is called AFTER each player's turn ends. Before the turn counter
     * increases.
     * This is a good place to check if they won the game during their turn,
     * and do end-of-turn effects.
     */
    protected async nextTurn(): Promise<void> {
${merge('        // ', 'next-turn', """        // add logic here after the current player's turn starts
""", optional=True, help=False)}

        super.nextTurn(); // this actually makes their turn end
    }

    /**
     * Called when the game needs to end, but primary game ending conditions
     * are not met (like max turns reached). Use this to check for secondary
     * game win conditions to crown a winner.
     * @param reason The reason why a secondary victory condition is happening
     */
    protected secondaryGameOver(reason: string): void {
${merge('        // ', 'secondary-game-over', """        // Add logic here checking for the secondary win conditions
""", optional=True, help=False)}

        this.makePlayerWinViaCoinFlip("Identical AIs played the game.");
    }

%endif
${merge('    // ', 'protected-private-methods', """
    // any additional protected/private methods you need can be added here

""", optional=True, help=False)}
}
