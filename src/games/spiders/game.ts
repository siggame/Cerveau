import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { SpidersGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { SpidersGameSettingsManager } from "./game-settings";
import { Nest } from "./nest";
import { Player } from "./player";
import { Web } from "./web";

// <<-- Creer-Merge: imports -->>
import { arrayHasElements, euclideanDistance, IPoint, MutableRequired,
       } from "~/utils";

/** A Player that can mutate before the game begins */
type MutablePlayer = MutableRequired<Player>;
// <<-- /Creer-Merge: imports -->>

/**
 * There's an infestation of enemy spiders challenging your queen broodmother
 * spider! Protect her and attack the other broodmother in this turn based,
 * node based, game.
 */
export class SpidersGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it */
    public readonly manager!: SpidersGameManager;

    /** The settings used to initialize the game, as set by players */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * The player whose turn it is currently. That player can send commands.
     * Other players cannot.
     */
    public currentPlayer!: Player;

    /**
     * The current turn number, starting at 0 for the first player's turn.
     */
    public currentTurn!: number;

    /**
     * The speed at which Cutters work to do cut Webs.
     */
    public readonly cutSpeed!: number;

    /**
     * Constant used to calculate how many eggs BroodMothers get on their
     * owner's turns.
     */
    public readonly eggsScalar!: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via
     * ID.
     */
    public gameObjects!: {[id: string]: GameObject};

    /**
     * The starting strength for Webs.
     */
    public readonly initialWebStrength!: number;

    /**
     * The maximum number of turns before the game will automatically end.
     */
    public readonly maxTurns!: number;

    /**
     * The maximum strength a web can be strengthened to.
     */
    public readonly maxWebStrength!: number;

    /**
     * The speed at which Spiderlings move on Webs.
     */
    public readonly movementSpeed!: number;

    /**
     * Every Nest in the game.
     */
    public nests!: Nest[];

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * The speed at which Spitters work to spit new Webs.
     */
    public readonly spitSpeed!: number;

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     */
    public readonly timeAddedPerTurn!: number;

    /**
     * How much web strength is added or removed from Webs when they are
     * weaved.
     */
    public readonly weavePower!: number;

    /**
     * The speed at which Weavers work to do strengthens and weakens on Webs.
     */
    public readonly weaveSpeed!: number;

    /**
     * Every Web in the game.
     */
    public webs!: Web[];

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Game is created.
     *
     * @param settingsManager - The manager that holds initial settings.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        protected settingsManager: SpidersGameSettingsManager,
        required: IBaseGameRequiredData,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>

        const mapWidth = 400;
        const mapHeight = 200;
        const deadzone = 25;
        const maxNests = 48; // per side, as are the mirrored
        const minNests = 8;
        const maxWebs = 20;
        const minWebs = 0;
        const minCrossWebs = 0;
        const maxCrossWebs = 4;

        // generare Nests on the left
        let numNests = this.manager.random.int(maxNests, minNests);

        // Try to place nests this many times before giving up because the map
        // is probably too congested
        let retries = 1000;
        for (let i = 0; i < numNests; i++) {
            while (--retries > 0) {
                let point: IPoint | undefined = {
                    x: this.manager.random.int(mapWidth / 2 - deadzone / 2),
                    y: this.manager.random.int(mapHeight),
                };

                for (const nest of this.nests) {
                    if (euclideanDistance(nest, point) <= deadzone) {
                        point = undefined;
                        break;
                    }
                }

                if (point) {
                    this.nests.push(this.manager.create.nest(point));
                    break; // out of while(retries), as the point was valid
                }
            }
        }

        // re-set just incase we had to abort above due to congestion
        numNests = this.nests.length;

        if (!arrayHasElements(this.nests)) {
            throw new Error("Spiders game has no nests!");
        }

        // generate Webs on the left
        const numWebs = this.manager.random.int(maxWebs, minWebs);
        for (let i = 0; i < numWebs; i++) {
            const nestA = this.manager.random.element(this.nests);
            if (!nestA) {
                throw new Error("No nests to create Webs.");
            }

            let nestB: Nest | undefined = nestA;
            while (nestB === nestA) {
                nestB = this.manager.random.element(this.nests);
            }

            this.manager.create.web({ nestA, nestB });
        }

        // create the BroodMother
        (this.players[0] as MutablePlayer).broodMother = this.manager.create.broodMother({
            owner: this.players[0],
            nest: this.manager.random.element(this.nests),
        });

        // now mirror it

        // mirror the Nests
        const mirrorNests = new Map<Nest, Nest>();
        for (let i = 0; i < numNests; i++) {
            const mirroring = this.nests[i];
            const mirrored = this.manager.create.nest({
                x: mapWidth - mirroring.x,
                y: mirroring.y,
            });

            // these are not exposed to competitors
            mirrorNests.set(mirroring, mirrored);
            mirrorNests.set(mirrored, mirroring);
        }

        // mirror the Webs
        for (const web of this.webs) {
            if (!web.hasNotSnapped()) {
                throw new Error("Invalid web on game creation!");
            }

            // get mirror the nests
            const nestA = mirrorNests.get(web.nestA);
            const nestB = mirrorNests.get(web.nestB);

            this.manager.create.web({ nestA, nestB });
        }

        // webs that cross the middle of the game
        const numCrossWebs = this.manager.random.int(minCrossWebs, maxCrossWebs);
        for (let i = 0; i < numCrossWebs; i++) {
            // the first half the the array has the nests on player 0's side
            const nestA = this.nests[this.manager.random.int(numNests - 1)];
             // and the other half has player 1's
            const nestB = this.nests[this.manager.random.int(numNests, numNests * 2 - 1)];
            this.manager.create.web({ nestA, nestB });

            const mirrorA = mirrorNests.get(nestA);
            const mirrorB = mirrorNests.get(nestB);
            if (mirrorNests.get(nestA) !== nestB) {
                // this is the mirror of the web created above, so long as the nests don't mirror each other already
                this.manager.create.web({ nestA: mirrorA, nestB: mirrorB });
            }
        }

        // mirror the BroodMother
        const secondPlayer: MutablePlayer = this.players[1];
        const nest0 = this.players[0].broodMother.nest;
        if (!nest0) {
            throw new Error("Player 0's BroodMother has no nest!");
        }
        const mirrorNest = mirrorNests.get(nest0);
        if (!mirrorNest) {
            throw new Error("Player 1's BroodMother has no nest!");
        }
        secondPlayer.broodMother = this.manager.create.broodMother({
            owner: this.players[1],
            nest: mirrorNest,
        });

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}
