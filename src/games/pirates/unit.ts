import { IBaseGameObjectRequiredData } from "~/core/game";
import { IUnitAttackArgs, IUnitBuryArgs, IUnitDepositArgs, IUnitDigArgs,
         IUnitMoveArgs, IUnitProperties, IUnitRestArgs, IUnitSplitArgs,
         IUnitWithdrawArgs } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Port } from "./port";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A unit group in the game. This may consist of a ship and any number of crew.
 */
export class Unit extends GameObject {
    /**
     * Whether this Unit has performed its action this turn.
     */
    public acted!: boolean;

    /**
     * How many crew are on this Tile. This number will always be <=
     * crewHealth.
     */
    public crew!: number;

    /**
     * How much total health the crew on this Tile have.
     */
    public crewHealth!: number;

    /**
     * How much gold this Unit is carrying.
     */
    public gold!: number;

    /**
     * How many more times this Unit may move this turn.
     */
    public moves!: number;

    /**
     * The Player that owns and can control this Unit, or undefined if the Unit
     * is neutral.
     */
    public owner?: Player;

    /**
     * (Merchants only) The path this Unit will follow. The first element is
     * the Tile this Unit will move to next.
     */
    public path!: Tile[];

    /**
     * If a ship is on this Tile, how much health it has remaining. 0 for no
     * ship.
     */
    public shipHealth!: number;

    /**
     * (Merchants only) The number of turns this merchant ship won't be able to
     * move. They will still attack. Merchant ships are stunned when they're
     * attacked.
     */
    public stunTurns!: number;

    /**
     * (Merchants only) The Port this Unit is moving to.
     */
    public targetPort?: Port;

    /**
     * The Tile this Unit is on.
     */
    public tile?: Tile;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Unit is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: Readonly<IUnitProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            /** The Tile to place this Unit upon. */
            tile: Tile;
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<IBaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>

        this.acted = true;
        this.crewHealth = this.crewHealth || (this.crew * this.game.crewHealth);

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invalidation function for attack. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to attack.
     * @param target - Whether to attack 'crew' or 'ship'. Crew deal damage to
     * crew and ships deal damage to ships. Consumes any remaining moves.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateAttack(
        player: Player,
        tile: Tile,
        target: "crew" | "ship",
    ): void | string | IUnitAttackArgs {
        // <<-- Creer-Merge: invalidate-attack -->>

        const reason = this.invalidate(player, true);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            throw new Error(`${this} has no Tile!`);
        }

        if (!tile.unit) {
            return `There be nothin' for ${this} to attack on ${tile}!`;
        }

        if (tile.unit.owner === player) {
            return `${this} doesn't have time for a mutany! Don't be attackin' yer own!`;
        }

        if (target === "crew") {
            if (tile.unit.crew <= 0) {
                return `${tile} has got no crew for you to attack!`;
            }
        }
        else { // target === "ship"
            if (tile.unit.shipHealth <= 0) {
                return `There be no ship for ${this} to attack.`;
            }
            if (this.shipHealth <= 0) {
                return `${this} has no ship to perform the attack.`;
            }
        }

        const dx = this.tile.x - tile.x;
        const dy = this.tile.y - tile.y;
        const distSq = dx * dx + dy * dy;
        const range = target === "crew"
            ? "crewRange"
            : "shipRange";
        if (distSq > (this.game[range] ** 2)) {
            return `${this} isn't in range for that attack. Ye don't wanna fire blindly into the wind!`;
        }

        // <<-- /Creer-Merge: invalidate-attack -->>
    }

    /**
     * Attacks either the 'crew' or 'ship' on a Tile in range.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to attack.
     * @param target - Whether to attack 'crew' or 'ship'. Crew deal damage to
     * crew and ships deal damage to ships. Consumes any remaining moves.
     * @returns True if successfully attacked, false otherwise.
     */
    protected async attack(
        player: Player,
        tile: Tile,
        target: "crew" | "ship",
    ): Promise<boolean> {
        // <<-- Creer-Merge: attack -->>

        if (!tile.unit) {
            throw new Error("tile has no unit, should be impossible");
        }

        let deadCrew = 0;
        let deadShips = 0;
        let gold = 0;
        const merchant = Boolean(tile.unit.targetPort);
        const neutral = !merchant && !tile.unit.owner;
        if (target === "crew") {
            // Crew attacking crew
            tile.unit.crewHealth -= this.game.crewDamage * this.crew;
            tile.unit.crewHealth = Math.max(0, tile.unit.crewHealth);

            // For counting the dead accurately
            if (tile.unit.crew > tile.unit.crewHealth) {
                deadCrew = tile.unit.crew - tile.unit.crewHealth;
                tile.unit.crew = tile.unit.crewHealth;
            }

            // Check if the crew was completely destroyed
            if (tile.unit.crewHealth <= 0) {
                if (tile.unit.shipHealth <= 0) {
                    gold += tile.unit.gold;

                    // Mark it as dead
                    tile.unit.tile = undefined;
                    tile.unit = undefined;
                }
                else {
                    tile.unit.owner = undefined;
                    tile.unit.shipHealth = 1;

                    // Make sure it's not a merchant ship anymore either
                    tile.unit.targetPort = undefined;
                    tile.unit.path.length = 0;
                }
            }
        }
        else {
            // Ship attacking ship
            tile.unit.shipHealth -= this.game.shipDamage;
            tile.unit.shipHealth = Math.max(0, tile.unit.shipHealth);

            // Check if ship was destroyed
            if (tile.unit.shipHealth <= 0) {
                deadShips += 1;
                gold += tile.unit.gold;
                deadCrew += tile.unit.crew;

                // Mark it as dead
                tile.unit.tile = undefined;
                tile.unit = undefined;
            }
        }

        // Infamy

        this.acted = true;
        this.gold += gold;

        // Calculate the infamy factor
        let factor = 1;
        if (!merchant) {
            // Calculate each player's net worth
            const allyWorth = player.netWorth() + player.gold - gold;
            const opponentWorth = (
                player.opponent.netWorth() + player.opponent.gold + gold
            ) + deadCrew * this.game.crewCost + deadShips * this.game.shipCost;

            if (allyWorth > opponentWorth) {
                factor = 0.5;
            }
            else if (allyWorth < opponentWorth) {
                factor = 2;
            }
        }

        // Calculate infamy
        let infamy = (deadCrew * this.game.crewCost + deadShips * this.game.shipCost) * factor;

        if (!neutral) {
            if (!merchant) {
                infamy = Math.min(infamy, player.opponent.infamy);
                player.opponent.infamy -= infamy;
            }

            player.infamy += infamy;
        }

        if (merchant && tile.unit) {
            tile.unit.stunTurns = 2;
        }

        return true;

        // <<-- /Creer-Merge: attack -->>
    }

    /**
     * Invalidation function for bury. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param amount - How much gold this Unit should bury. Amounts <= 0 will
     * bury as much as possible.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateBury(
        player: Player,
        amount: number,
    ): void | string | IUnitBuryArgs {
        // <<-- Creer-Merge: invalidate-bury -->>

        const reason = this.invalidate(player);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            throw new Error(`${this} has no Tile!`);
        }

        if (this.tile.type !== "land") {
            return `${this} can't bury gold on the sea.`;
        }

        if (this.tile.port) {
            return `${this} can't bury gold in ports.`;
        }

        if (this.tile.gold >= this.game.settings.maxTileGold) {
            return `${this} can't bury loot on a tile with the max amount of booty (${
                this.game.settings.maxTileGold
            }).`;
        }

        const dx = this.tile.x - player.port.tile.x;
        const dy = this.tile.y - player.port.tile.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < this.game.minInterestDistance * this.game.minInterestDistance) {
            return `${this} is too close to home! Ye gotta bury yer loot far away from yer port.`;
        }

        let actualAmount = amount <= 0
            ? this.gold
            : Math.min(this.gold, amount);

        actualAmount = Math.min(
            this.game.settings.maxTileGold - this.tile.gold,
            actualAmount,
        );

        if (actualAmount <= 0) {
            return `${this} doesn't have any gold to bury! Ye poor scallywag.`;
        }

        return { amount: actualAmount };

        // <<-- /Creer-Merge: invalidate-bury -->>
    }

    /**
     * Buries gold on this Unit's Tile. Gold must be a certain distance away
     * for it to get interest (Game.minInterestDistance).
     *
     * @param player - The player that called this.
     * @param amount - How much gold this Unit should bury. Amounts <= 0 will
     * bury as much as possible.
     * @returns True if successfully buried, false otherwise.
     */
    protected async bury(player: Player, amount: number): Promise<boolean> {
        // <<-- Creer-Merge: bury -->>

        if (!this.tile) {
            throw new Error(`${this} has no Tile to bury gold!`);
        }

        this.tile.gold += amount;
        this.gold -= amount;

        return true;

        // <<-- /Creer-Merge: bury -->>
    }

    /**
     * Invalidation function for deposit. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param amount - The amount of gold to deposit. Amounts <= 0 will deposit
     * all the gold on this Unit.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateDeposit(
        player: Player,
        amount: number = 0,
    ): void | string | IUnitDepositArgs {
        // <<-- Creer-Merge: invalidate-deposit -->>

        const reason = this.invalidate(player);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            throw new Error(`${this} has no Tile!`);
        }

        const tiles = [ this.tile, ...this.tile.getNeighbors() ];
        const found = tiles.find(
            (t) => Boolean(t && t.port && t.port.owner !== player.opponent),
        );

        if (!found) {
            return `Arr, ${this} has to deposit yer booty in yer home port or a merchant port, matey!`;
        }

        if (this.gold <= 0) {
            return `Shiver me timbers! ${this} doesn't have any booty to deposit!`;
        }

        let actualAmount = Math.min(Math.max(amount, 0), this.gold);
        if (actualAmount <= 0) {
            actualAmount = this.gold;
        }

        return { amount: actualAmount };

        // <<-- /Creer-Merge: invalidate-deposit -->>
    }

    /**
     * Puts gold into an adjacent Port. If that Port is the Player's port, the
     * gold is added to that Player. If that Port is owned by merchants, it
     * adds to that Port's investment.
     *
     * @param player - The player that called this.
     * @param amount - The amount of gold to deposit. Amounts <= 0 will deposit
     * all the gold on this Unit.
     * @returns True if successfully deposited, false otherwise.
     */
    protected async deposit(
        player: Player,
        amount: number = 0,
    ): Promise<boolean> {
        // <<-- Creer-Merge: deposit -->>

        this.gold -= amount;

        if (!this.tile) {
            throw new Error(`${this} has no Tile to deposit gold!`);
        }

        const tiles = [ this.tile, ...this.tile.getNeighbors() ];
        let tile = tiles.find(
            (t) => Boolean(t && t.port && t.port.owner !== player.opponent),
        ); // will be found as we validated it above

        if (tile) {
            player.gold += amount;
        }
        else {
            // Get the merchant's port
            tile = tiles.find((t) => Boolean(t && t.port && !t.port.owner));
            if (!tile) {
                throw new Error("Could not find perchant port tile to deposit money on!");
            }

            if (!tile.port) {
                throw new Error(`${tile} has no port to deposit money on to!`);
            }
            tile.port.investment += amount;
        }

        return true;

        // <<-- /Creer-Merge: deposit -->>
    }

    /**
     * Invalidation function for dig. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param amount - How much gold this Unit should take. Amounts <= 0 will
     * dig up as much as possible.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateDig(
        player: Player,
        amount: number = 0,
    ): void | string | IUnitDigArgs {
        // <<-- Creer-Merge: invalidate-dig -->>

        const reason = this.invalidate(player);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            throw new Error(`${this} has no Tile!`);
        }

        // Checking to see if the tile is anything other than a land type.
        if (this.tile.type !== "land") {
            return `${this} can't dig in the sea!`;
        }

        // Checking to see if the tile has gold to be dug up.
        if (this.tile.gold === 0) {
            return `There be no booty for ${this} to plunder.`;
        }

        const actualAmount = amount <= 0 || amount > this.tile.gold
            ? this.tile.gold
            : amount;

        return { amount: actualAmount };

        // <<-- /Creer-Merge: invalidate-dig -->>
    }

    /**
     * Digs up gold on this Unit's Tile.
     *
     * @param player - The player that called this.
     * @param amount - How much gold this Unit should take. Amounts <= 0 will
     * dig up as much as possible.
     * @returns True if successfully dug up, false otherwise.
     */
    protected async dig(
        player: Player,
        amount: number = 0,
    ): Promise<boolean> {
        // <<-- Creer-Merge: dig -->>

        if (!this.tile) {
            throw new Error(`${this} has no Tile to dig!`);
        }

        // Adds amount requested to Unit.
        this.gold += amount;
        // Subtracts amount from Tile's gold
        this.tile.gold -= amount;

        return true;

        // <<-- /Creer-Merge: dig -->>
    }

    /**
     * Invalidation function for move. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile this Unit should move to.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateMove(
        player: Player,
        tile: Tile,
    ): void | string | IUnitMoveArgs {
        // <<-- Creer-Merge: invalidate-move -->>

        const reason = this.invalidate(player);
        if (reason) {
            return reason;
        }

        const ship = this.shipHealth > 0;
        if (this.moves <= 0) {
            return `${this}'s crew are too tired to travel any further.`;
        }

        if (this.acted) {
            return `${this} can't move after acting. The men are too tired!`;
        }

        if (!this.tile) {
            throw new Error(`${this} has no Tile!`);
        }

        if (!this.tile.hasNeighbor(tile)) {
            return `${tile} be too far for ${this} to move to.`;
        }

        if (tile.unit && tile.unit.owner && tile.unit.owner !== player) {
            return `${this} refuses to share the same ground with a living foe.`;
        }

        if (!ship && tile.type === "water" && !tile.port && !(tile.unit && tile.unit.shipHealth > 0)) {
            return `${this} has no ship and can't walk on water!`;
        }

        if (ship && tile.type === "land") {
            return `Land ho! ${this} belongs in the sea! Use 'Unit.split' if ye want to move just yer crew ashore.`;
        }

        if (ship && tile.unit && tile.unit.shipHealth > 0) {
            return `There be a ship there. If ye move ${this} to ${tile}, ye'll scuttle yer ship!`;
        }

        if (!ship && tile.unit && tile.unit.shipHealth > 0 && this.acted) {
            return `${this} already acted, and it be too tired to board that ship.`;
        }

        if (tile.port && tile.port.owner !== player) {
            return `${this} can't enter an enemy port!`;
        }

        if (ship && tile.port && tile.unit && tile.unit.shipHealth > 0) {
            return `${this} can't move into yer port, ye'll scuttle yer ship!`;
        }

        // <<-- /Creer-Merge: invalidate-move -->>
    }

    /**
     * Moves this Unit from its current Tile to an adjacent Tile. If this Unit
     * merges with another one, the other Unit will be destroyed and its tile
     * will be set to undefined. Make sure to check that your Unit's tile is
     * not undefined before doing things with it.
     *
     * @param player - The player that called this.
     * @param tile - The Tile this Unit should move to.
     * @returns True if it moved, false otherwise.
     */
    protected async move(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: move -->>

        if (tile.unit) {
            // combine with that unit
            const other = tile.unit;
            other.tile = undefined;
            tile.unit = this;
            this.tile = tile;

            this.gold += other.gold;
            this.crew += other.crew;
            this.crewHealth += other.crewHealth;
            this.shipHealth += other.shipHealth;
            this.acted = this.acted || other.acted || other.shipHealth > 0;
            this.moves = Math.min(this.moves - 1, other.moves);
        }
        else {
            if (!this.tile) {
                throw new Error(`${this} has no Tile to move from!`);
            }
            // Move this unit to that tile
            this.tile.unit = undefined;
            this.tile = tile;
            tile.unit = this;
            this.moves -= 1;
        }

        return true;

        // <<-- /Creer-Merge: move -->>
    }

    /**
     * Invalidation function for rest. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateRest(player: Player): void | string | IUnitRestArgs {
        // <<-- Creer-Merge: invalidate-rest -->>

        const reason = this.invalidate(player, true);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            throw new Error(`${this} has no Tile!`);
        }

        // Check if it's in range
        const radius = this.game.restRange;
        if (((this.tile.x - player.port.tile.x) ** 2 + (this.tile.y - player.port.tile.y) ** 2) > radius ** 2) {
            return `${this} has no nearby port to rest at. No home tavern means no free rum!`;
        }

        // <<-- /Creer-Merge: invalidate-rest -->>
    }

    /**
     * Regenerates this Unit's health. Must be used in range of a port.
     *
     * @param player - The player that called this.
     * @returns True if successfully rested, false otherwise.
     */
    protected async rest(player: Player): Promise<boolean> {
        // <<-- Creer-Merge: rest -->>

        // Heal the units
        this.crewHealth += Math.ceil(this.game.crewHealth * this.game.healFactor) * this.crew;
        this.crewHealth = Math.min(this.crewHealth, this.crew * this.game.crewHealth);
        if (this.shipHealth > 0) {
            this.shipHealth += Math.ceil(this.game.shipHealth * this.game.healFactor);
            this.shipHealth = Math.min(this.shipHealth, this.game.shipHealth);
        }

        // Make sure the unit can't do anything else this turn
        this.acted = true;
        this.moves = 0;

        return true;

        // <<-- /Creer-Merge: rest -->>
    }

    /**
     * Invalidation function for split. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to move the crew to.
     * @param amount - The number of crew to move onto that Tile. Amount <= 0
     * will move all the crew to that Tile.
     * @param gold - The amount of gold the crew should take with them. Gold <
     * 0 will move all the gold to that Tile.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateSplit(
        player: Player,
        tile: Tile,
        amount: number = 1,
        gold: number = 0,
    ): void | string | IUnitSplitArgs {
        // <<-- Creer-Merge: invalidate-split -->>

        const reason = this.invalidate(player);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            return `${this} must be on a Tile!`;
        }

        if (!tile) {
            return `${this} can't split onto null!`;
        }

        // Check to see if the crew has a move to move
        if (this.moves <= 0) {
            return `${this} can't split cause they be out of moves.`;
        }

        // Check to see if they have already acted.
        if (this.acted) {
            return `${this} crew are too tired to split!`;
        }

        // Check to see if it is not one of the tiles around in the current direction
        if (!this.tile.hasNeighbor(tile)) {
            return `${tile} be too far for ${this} to split to.`;
        }

        // Check to make sure target tile is a valid tile
        if (tile.type === "water" && !tile.unit && !tile.port) {
            return `${this} can't split onto water!`;
        }

        if (tile.unit && (tile.unit.owner === player.opponent || tile.unit.targetPort)) {
            return `${this} can't split onto enemy pirates!`;
        }

        if (tile.port && tile.port.owner !== player) {
            return `${this} can't split onto enemy ports!`;
        }

        // Adjust the amount of crew to split
        const actualAmount = amount <= 0
            ? this.crew
            : Math.min(amount, this.crew);

        // Adjust the amount of gold to split
        const actualGold = ((amount === this.crew && this.shipHealth <= 0) || gold < 0)
            ? this.gold
            : Math.min(gold, this.gold);

        return {
            amount: actualAmount,
            gold: actualGold,
        };

        // <<-- /Creer-Merge: invalidate-split -->>
    }

    /**
     * Moves a number of crew from this Unit to the given Tile. This will
     * consume a move from those crew.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to move the crew to.
     * @param amount - The number of crew to move onto that Tile. Amount <= 0
     * will move all the crew to that Tile.
     * @param gold - The amount of gold the crew should take with them. Gold <
     * 0 will move all the gold to that Tile.
     * @returns True if successfully split, false otherwise.
     */
    protected async split(
        player: Player,
        tile: Tile,
        amount: number = 1,
        gold: number = 0,
    ): Promise<boolean> {
        // <<-- Creer-Merge: split -->>

        if (!this.tile) {
            throw new Error("Unit split in invalid state!");
        }

        const originalCrew = this.crew;

        // Create a new unit
        const newUnit = {
            tile,
            gold,
            owner: player,
            crew: amount,
            moves: this.moves - 1,

            // Check if boarding a ship
            acted: tile.unit && tile.unit.shipHealth > 0,

            // Crew health
            crewHealth: amount === this.crew
                ? this.crewHealth
                : Math.ceil((this.crewHealth / originalCrew) * amount),
        };

        // Move the crew
        this.crew -= amount;

        // Adjust the amount of gold to split
        newUnit.gold = ((amount === this.crew && this.shipHealth <= 0) || gold < 0)
            ? this.gold
            : Math.min(gold, this.gold);
        this.gold -= newUnit.gold;

        // Crew health
        newUnit.crewHealth = amount === this.crew
            ? this.crewHealth
            : Math.ceil((this.crewHealth / originalCrew) * amount);
        this.crewHealth -= newUnit.crewHealth || 0;

        // Ownership
        if (this.crew <= 0) {
            // Disassociating from old Tile if all the crew moved
            this.owner = undefined;
            if (this.shipHealth <= 0) {
                // If no units are left over, remove the unit
                this.tile.unit = undefined;
                this.tile = undefined;
            }
        }

        // Check if merging with another unit
        if (tile.unit) {
            const other = tile.unit;
            other.owner = player;
            other.gold += newUnit.gold || 0;
            other.crew += newUnit.crew || 0;
            other.crewHealth += newUnit.crewHealth || 0;
            other.acted = other.acted || other.shipHealth > 0;
            other.moves = Math.min(newUnit.moves || 0, other.moves);
        }
        else {
            const unit = this.game.manager.create.unit(newUnit);
            if (!unit.tile) {
                throw new Error("New unit is not on a Tile somehow!");
            }
            tile.unit = unit;
            this.game.manager.newUnits.push(unit);
        }

        tile.unit.owner = player;

        return true;

        // <<-- /Creer-Merge: split -->>
    }

    /**
     * Invalidation function for withdraw. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param amount - The amount of gold to withdraw. Amounts <= 0 will
     * withdraw everything.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateWithdraw(
        player: Player,
        amount: number = 0,
    ): void | string | IUnitWithdrawArgs {
        // <<-- Creer-Merge: invalidate-withdraw -->>

        const reason = this.invalidate(player);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            throw new Error(`${this} has no Tile!`);
        }

        const tile = player.port.tile;
        if (this.tile !== tile && !this.tile.hasNeighbor(tile)) {
            return `${this} has to withdraw yer booty from yer home port, matey!`;
        }

        let actualAmount = amount;

        if (actualAmount <= 0) {
            // Take all the gold
            actualAmount = player.gold;
        }

        // cap the amount taken by how much gold they have
        // (so they can't withdraw more gold than their player has)
        actualAmount = Math.min(actualAmount, player.gold);

        return { amount: actualAmount };

        // <<-- /Creer-Merge: invalidate-withdraw -->>
    }

    /**
     * Takes gold from the Player. You can only withdraw from your own Port.
     *
     * @param player - The player that called this.
     * @param amount - The amount of gold to withdraw. Amounts <= 0 will
     * withdraw everything.
     * @returns True if successfully withdrawn, false otherwise.
     */
    protected async withdraw(
        player: Player,
        amount: number = 0,
    ): Promise<boolean> {
        // <<-- Creer-Merge: withdraw -->>

        this.gold += amount;
        player.gold -= amount;

        return true;

        // <<-- /Creer-Merge: withdraw -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * Tries to invalidate args for an action function
     *
     * @param player - the player commanding this Unit
     * @param checkAction - true to check if this Unit has an action
     * @returns the reason this is invalid, undefined if looks valid so far
     */
    private invalidate(player: Player, checkAction?: true): string | undefined {
        if (!player || player !== this.game.currentPlayer) {
            return `Avast, it isn't yer turn, ${player}.`;
        }

        if (this.owner !== player) {
            return `${this} isn't among yer crew.`;
        }

        if (checkAction && this.acted) {
            return `${this} can't perform another action this turn.`;
        }

        if (!this.tile || this.crew === 0) {
            return `Ye can't control ${this}.`;
        }
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}
