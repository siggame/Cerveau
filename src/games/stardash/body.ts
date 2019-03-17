import { IBaseGameObjectRequiredData } from "~/core/game";
import { IBodyProperties, IBodySpawnArgs } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The type of celestial body it is.
 */
export type BodyBodyType = "planet" | "asteroid" | "sun";

/**
 * The type of material the celestial body has.
 */
export type BodyMaterialType = "none" | "genarium" | "rarium" | "legendarium" | "mythicite";

/**
 * A celestial body located within the game.
 */
export class Body extends GameObject {
    /**
     * The amount of material the object has.
     */
    public amount!: number;

    /**
     * The type of celestial body it is.
     */
    public readonly bodyType!: "planet" | "asteroid" | "sun";

    /**
     * The type of material the celestial body has.
     */
    public readonly materialType!: "none" | "genarium" | "rarium" | "legendarium" | "mythicite";

    /**
     * The Player that owns and can control this Unit.
     */
    public owner?: Player;

    /**
     * The radius of the circle that this body takes up.
     */
    public radius!: number;

    /**
     * The x value this celestial body is on.
     */
    public x!: number;

    /**
     * The y value this celestial body is on.
     */
    public y!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Body is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: Readonly<IBodyProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<IBaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invalidation function for spawn. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param x - The x value of the spawned unit.
     * @param y - The y value of the spawned unit.
     * @param title - The job title of the unit being spawned.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateSpawn(
        player: Player,
        x: number,
        y: number,
        title: string,
    ): void | string | IBodySpawnArgs {
        // <<-- Creer-Merge: invalidate-spawn -->>
        // Check if it is the spawning player's turn
        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }
        // Check if the supplied title is valid
        if (title !== "corvette" && title !== "missleboat" && "martyr" &&
            title !== "transport" && title !== "miner") {
            return `You must supply a valid job title.`;
        }
        // Check if the body is controlled by the player
        if (this.owner !== player || this.owner === undefined) {
            return `${this} isn't owned by you.`;
        }
        // Check if the body is indeed a planet
        if (this.bodyType !== "planet") {
            return `${this} isn't a planet, so you can't make ships here.`;
        }
        // Check if the player is trying to spawn the unit too far from their planet's surface
        if ( sqrt(pow((x - this.x), 2) + pow((y - this.y), 2)) > this.radius ) {
            return `You must spawn units on your planet!`;
        }
        // Check if the player has the resources to spawn the ship
        // Slow solution; proposed: identify input job and check individual cost?
        // Unsure of how to implement above proposal
        if ((player.money < 75 && (title === "miner" || title === "transport")) ||
            (player.money < 100 && title === "corvette") || (player.money < 125 && title === "missleboat") ||
            (player.money < 150 && title === "martyr")) {
            return `You do not have enough resources to spawn this ship.`;
        }
        // Check if the space in which the player is trying to spawn the unit is occupied
        // Implemented as advised
        // Correct?
        if (!(x.isopen()) && !(y.isopen())) {
        	return `This space is occupied. You cannot spawn a ship here.`
        }

        // Check all the arguments for spawn here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-spawn -->>
    }

    /**
     * Spawn a unit on some value of this celestial body.
     *
     * @param player - The player that called this.
     * @param x - The x value of the spawned unit.
     * @param y - The y value of the spawned unit.
     * @param title - The job title of the unit being spawned.
     * @returns True if successfully taken, false otherwise.
     */
    protected async spawn(
        player: Player,
        x: number,
        y: number,
        title: string,
    ): Promise<boolean> {
        // <<-- Creer-Merge: spawn -->>

        if ( title === "corvette" ) {
        	// Deduct ship cost from player's balance
        	player.money -= 100;
        	// Adds desired unit to player's unit arsenal
        	// Unsure if correct implementation
        	player.units.push(this.game.manager.create.unit({
        		acted: 1,
        		energy: 100,
        		genarium: 0,
        		isDashing: 0,
        		job: this.game.jobs[0],
        		legendarium: 0,
        		moves: 0; // correct?
        		mythicite: 0,
        		owner: player,
        		rarium: 0;
        		x: x,
        		y: y,
        	}))
        }

        else if ( title === "missleboat" ) {
        	// Deduct ship cost from player's balance
        	player.money -= 125;
        	// Adds desired unit to player's unit arsenal
        	// Unsure if correct implementation
        	player.units.push(this.game.manager.create.unit({
        		acted: 1,
        		energy: 100,
        		genarium: 0,
        		isDashing: 0,
        		job: this.game.jobs[1],
        		legendarium: 0,
        		moves: 0; // correct?
        		mythicite: 0,
        		owner: player,
        		rarium: 0;
        		x: x,
        		y: y,
        	}))
        }

        else if ( title === "martyr" ) {
        	// Deduct ship cost from player's balance
        	player.money -= 125;
        	// Adds desired unit to player's unit arsenal
        	// Unsure if correct implementation
        	player.units.push(this.game.manager.create.unit({
        		acted: 1,
        		energy: 100,
        		genarium: 0,
        		isDashing: 0,
        		job: this.game.jobs[2],
        		legendarium: 0,
        		moves: 0; // correct?
        		mythicite: 0,
        		owner: player,
        		rarium: 0;
        		x: x,
        		y: y,
        	}))
        }

        else if ( title === "transport" ) {
        	// Deduct ship cost from player's balance
        	player.money -= 75;
        	// Adds desired unit to player's unit arsenal
        	// Unsure if correct implementation
        	player.units.push(this.game.manager.create.unit({
        		acted: 1,
        		energy: 100,
        		genarium: 0,
        		isDashing: 0,
        		job: this.game.jobs[3],
        		legendarium: 0,
        		moves: 0; // correct?
        		mythicite: 0,
        		owner: player,
        		rarium: 0;
        		x: x,
        		y: y,
        	}))
        }

        else {
        	// Deduct ship cost from player's balance
        	player.money -= 75;
        	// Adds desired unit to player's unit arsenal
        	// Unsure if correct implementation
        	player.units.push(this.game.manager.create.unit({
        		acted: 1,
        		energy: 100,
        		genarium: 0,
        		isDashing: 0,
        		job: this.game.jobs[4],
        		legendarium: 0,
        		moves: 0; // correct?
        		mythicite: 0,
        		owner: player,
        		rarium: 0;
        		x: x,
        		y: y,
        	}))
        }

        return true;

        // <<-- /Creer-Merge: spawn -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}
