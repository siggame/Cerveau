// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, SaloonGame, SaloonGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>
import { filterInPlace } from "~/utils";
import { Bottle } from "./bottle";
import { Cowboy } from "./cowboy";
import { Tile } from "./tile";
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Saloon Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class SaloonGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-18-Saloon",
            "MegaMiner-AI-18-Saloon",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing */
    public readonly game!: SaloonGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: SaloonGameObjectFactory;

    // <<-- Creer-Merge: public-methods -->>

    /**
     * list of cowboys to add to their cowboy lists between turns (so we don't
     * resize arrays during players turns)
     */
    public readonly spawnedCowboys: Cowboy[] = [];

    /**
     * Checks if someone won, and if so declares a winner
     *
     * @returns True if there was a winner and the game is over, false otherwise
     */
    public checkForWinner(): void {
        if (this.primaryWinConditionsCheck()) {
            this.endGame();
        }
    }

    // <<-- /Creer-Merge: public-methods -->>

    /**
     * This is called BEFORE each player's runTun function is called
     * (including the first turn).
     * This is a good place to get their player ready for their turn.
     */
    protected async beforeTurn(): Promise<void> {
        await super.beforeTurn();

        // <<-- Creer-Merge: before-turn -->>
        // add logic here for before the current player's turn starts
        // <<-- /Creer-Merge: before-turn -->>
    }

    /**
     * This is called AFTER each player's turn ends. Before the turn counter
     * increases.
     * This is a good place to end-of-turn effects, and clean up arrays.
     */
    protected async afterTurn(): Promise<void> {
        await super.afterTurn();

        // <<-- Creer-Merge: after-turn -->>
        this.updateSpawnedCowboys();

        this.game.currentPlayer.siesta = Math.max(0, this.game.currentPlayer.siesta - 1);
        this.updateCowboys();
        this.advanceBottles();
        this.resetPianoPlaying();
        this.applyHazardDamage();

        filterInPlace(this.game.cowboys, (c) => !c.isDead);
        filterInPlace(this.game.furnishings, (f) => !f.isDestroyed);
        filterInPlace(this.game.bottles, (b) => !b.isDestroyed);

        this.game.currentPlayer.youngGun.update();
        // <<-- /Creer-Merge: after-turn -->>
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
        super.primaryWinConditionsCheck();

        // <<-- Creer-Merge: primary-win-conditions -->>

        const alivePianos = this.game.furnishings.filter((f) => !f.isDestroyed && f.isPiano);

        if (alivePianos.length === 0) { // game over
            this.secondaryWinConditions("all pianos destroyed.");
        }

        // check to see if one player has more score than the other can possibly get
        const winning = this.game.players[0].score > this.game.players[1].score
            ? this.game.players[0]
            : this.game.players[1];

        // this assumes they play every piano on every remaining turn
        const remainingTurns = this.game.maxTurns - this.game.currentTurn;
        const maxAdditionalScore = Math.ceil(alivePianos.length * remainingTurns / 2);
        if (winning.score > winning.opponent.score + maxAdditionalScore) {
            // then the losing player can't catch up to the winner's score,
            // so end the game early
            this.declareWinner(
                `Score (${winning.score}) high enough that the opponent can't `
                + `win in the remaining turns (${remainingTurns}).`,
                winning,
            );

            this.declareLoser(
                "Score too low to catch up to the winner in the number of remaining turns.",
                winning.opponent,
            );

            return true;
        }

        // <<-- /Creer-Merge: primary-win-conditions -->>

        return false; // If we get here no one won on this turn.
    }

    /**
     * Called when the game needs to end, but primary game ending conditions
     * are not met (like max turns reached). Use this to check for secondary
     * game win conditions to crown a winner.
     * @param reason The reason why a secondary victory condition is happening
     */
    protected secondaryWinConditions(reason: string): void {
        // <<-- Creer-Merge: secondary-win-conditions -->>

        const { players } = this.game;
        if (players[0].score !== players[1].score) { // someone won with a higher score
            const winner = players[0].score > players[1].score
                ? players[0]
                : players[1];

            this.declareWinner(`${reason} - Has highest score (${winner.score}).`, winner);
            this.declareLoser("Lower score than winner", winner.opponent);
            this.endGame();

            return;
        }

        if (players[0].kills !== players[1].kills) { // someone won with a higher kills
            const winner = players[0].kills > players[1].kills
                ? players[0]
                : players[1];

            this.declareWinner(`${reason} - Has the most kills (${winner.kills}).`, winner);
            this.declareLoser("Less kills than winner", winner.opponent);
            this.endGame();

            return;
        }

        // <<-- /Creer-Merge: secondary-win-conditions -->>

        // This will end the game.
        // If no winner it determined above, then a random one will be chosen.
        super.secondaryWinConditions(reason);
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    /**
     * Take all the cowboys spawned during the turn and put them in the appropriate arrays
     */
    private updateSpawnedCowboys(): void {
        for (const cowboy of this.spawnedCowboys) {
            this.game.cowboys.push(cowboy);
            cowboy.owner.cowboys.push(cowboy);

        }

        this.spawnedCowboys.length = 0;
    }

    /**
     * Updates all the cowboys with in-between turns logic.
     */
    private updateCowboys(): void {
        for (const cowboy of this.game.currentPlayer.cowboys) {
            if (cowboy.isDead || !cowboy.tile) {
                continue; // don't update dead dudes, they won't come back
            }

            if (cowboy.isDrunk) {
                if (cowboy.drunkDirection !== "") {
                    // then they are not drunk because of a siesta, so move them
                    const next = cowboy.tile.getNeighbor(cowboy.drunkDirection);
                    if (!next) {
                        throw new Error(`${this} somehow is trying to walk off the map!`);
                    }

                    if (next.isBalcony || next.cowboy || next.furnishing) { // then something is in the way
                        if (next.cowboy) {
                            next.cowboy.focus = 0;
                        }

                        if (next.isBalcony || next.furnishing) {
                            cowboy.damage(1);
                            if (cowboy.isDead) { // RIP he died from that
                                continue; // don't update dead dudes, they won't come back
                            }
                        }
                    }
                    else { // the next tile is valid
                        cowboy.tile.cowboy = undefined;
                        cowboy.tile = next;
                        next.cowboy = cowboy;

                        if (next.bottle) {
                            next.bottle.break();
                        }
                    }
                }

                cowboy.turnsBusy = Math.max(0, cowboy.turnsBusy - 1);
                cowboy.isDrunk = (cowboy.turnsBusy !== 0);
                cowboy.canMove = !cowboy.isDrunk;
            }
            else { // they are not drunk, so update them for use next turn
                if (cowboy.job === "Sharpshooter" && cowboy.canMove && cowboy.turnsBusy === 0) {
                    // then the sharpshooter didn't move, so increase his focus
                    cowboy.focus++;
                }

                cowboy.canMove = true;
            }

            cowboy.turnsBusy = Math.max(0, cowboy.turnsBusy - 1);

            if (cowboy.job === "Brawler") { // damage surroundings
                for (const neighbor of cowboy.tile.getNeighbors()) {
                    if (neighbor.cowboy) { // if there is a cowboy, damage them
                        neighbor.cowboy.damage(this.game.brawlerDamage);
                    }
                    if (neighbor.furnishing) { // if there is a furnishing, damage it
                        neighbor.furnishing.damage(this.game.brawlerDamage);
                    }
                }
            }
        }
    }

   /**
    * Moves all bottles currently in the game
    */
    private advanceBottles(): void {
        const bottlesAtTile = new Map<Tile, Bottle[]>();

        // Make a copy as bottles breaking could change the array's size during
        // iteration
        for (const bottle of this.game.bottles.slice()) {
            if (bottle.isDestroyed) {
                continue;
            }

            bottle.advance();
            if (!bottle.isDestroyed && bottle.tile) {
                let bottles = bottlesAtTile.get(bottle.tile);
                if (!bottles) {
                    bottles = [];
                    bottlesAtTile.set(bottle.tile, bottles);
                }
                bottles.push(bottle);
            }
        }

        // now check for bottle <--> bottle collisions, and cleanup
        for (const [tile, bottles] of bottlesAtTile) {
            if (bottles.length > 1) { // there's more than 1 bottle on that tile, break them all
                for (const bottle of bottles) {
                    bottle.break();
                }
            }
            else { // there is 1 or 0 bottles on the tile with `id`
                tile.bottle = bottles[0];
            }

            tile.bottle = tile.bottle || undefined;
        }
    }

    /**
     * Damages all pianos 1 damage, accelerating the game
     */
    private resetPianoPlaying(): void {
        for (const furnishing of this.game.furnishings) {
            if (furnishing.isDestroyed || !furnishing.isPiano) {
                continue;
            }
            // else it's a non destroyed piano
            furnishing.isPlaying = false;
        }
    }

    /**
     * Damages all cowboys which are standing on a hazard
     */
    private applyHazardDamage(): void {
        for (const cowboy of this.game.cowboys) {
            if (cowboy.tile && cowboy.tile.hasHazard) {
                cowboy.damage(1);
            }
        }
    }

    // <<-- /Creer-Merge: protected-private-methods -->>
}
