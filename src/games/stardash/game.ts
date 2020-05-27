import { BaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { Body } from "./body";
import { StardashGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { StardashGameSettingsManager } from "./game-settings";
import { Job } from "./job";
import { Player } from "./player";
import { Projectile } from "./projectile";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Collect of the most of the rarest mineral orbiting aroung the sun and
 * outcompete your competetor.
 */
export class StardashGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it. */
    public readonly manager!: StardashGameManager;

    /** The settings used to initialize the game, as set by players. */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * All the celestial bodies in the game. The first two are planets and the
     * third is the sun. The fourth is the VP asteroid. Everything else is
     * normal asteroids.
     */
    public bodies!: Body[];

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
     * The cost of dashing.
     */
    public readonly dashCost!: number;

    /**
     * The distance traveled each turn by dashing.
     */
    public readonly dashDistance!: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     */
    public gameObjects!: { [id: string]: GameObject };

    /**
     * The value of every unit of genarium.
     */
    public readonly genariumValue!: number;

    /**
     * A list of all jobs. The first element is corvette, second is
     * missileboat, third is martyr, fourth is transport, and fifth is miner.
     */
    public jobs!: Job[];

    /**
     * The value of every unit of legendarium.
     */
    public readonly legendariumValue!: number;

    /**
     * The highest amount of material, that can be in a asteroid.
     */
    public readonly maxAsteroid!: number;

    /**
     * The maximum number of turns before the game will automatically end.
     */
    public readonly maxTurns!: number;

    /**
     * The smallest amount of material, that can be in a asteroid.
     */
    public readonly minAsteroid!: number;

    /**
     * The rate at which miners grab minerals from asteroids.
     */
    public readonly miningSpeed!: number;

    /**
     * The amount of mythicite that spawns at the start of the game.
     */
    public readonly mythiciteAmount!: number;

    /**
     * The number of orbit updates you cannot mine the mithicite asteroid.
     */
    public readonly orbitsProtected!: number;

    /**
     * The rarity modifier of the most common ore. This controls how much
     * spawns.
     */
    public readonly oreRarityGenarium!: number;

    /**
     * The rarity modifier of the rarest ore. This controls how much spawns.
     */
    public readonly oreRarityLegendarium!: number;

    /**
     * The rarity modifier of the second rarest ore. This controls how much
     * spawns.
     */
    public readonly oreRarityRarium!: number;

    /**
     * The amount of energy a planet can hold at once.
     */
    public readonly planetEnergyCap!: number;

    /**
     * The amount of energy the planets restore each round.
     */
    public readonly planetRechargeRate!: number;

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * The standard size of ships.
     */
    public readonly projectileRadius!: number;

    /**
     * The amount of distance missiles travel through space.
     */
    public readonly projectileSpeed!: number;

    /**
     * Every projectile in the game.
     */
    public projectiles!: Projectile[];

    /**
     * The value of every unit of rarium.
     */
    public readonly rariumValue!: number;

    /**
     * The regeneration rate of asteroids.
     */
    public readonly regenerateRate!: number;

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * The standard size of ships.
     */
    public readonly shipRadius!: number;

    /**
     * The size of the map in the X direction.
     */
    public readonly sizeX!: number;

    /**
     * The size of the map in the Y direction.
     */
    public readonly sizeY!: number;

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     */
    public readonly timeAddedPerTurn!: number;

    /**
     * The number of turns it takes for a asteroid to orbit the sun. (Asteroids
     * move after each players turn).
     */
    public readonly turnsToOrbit!: number;

    /**
     * Every Unit in the game.
     */
    public units!: Unit[];

    // <<-- Creer-Merge: attributes -->>

    /**
     * Stores mythicite that was lost via unit death.
     */
    public lostMythicite!: number;

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
        protected settingsManager: StardashGameSettingsManager,
        required: Readonly<BaseGameRequiredData>,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>
        this.createJobs();

        this.createMap();

        this.lostMythicite = 0;
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /**
     * Updates the protector for a unit.
     *
     * @param unit - The unit that needs it's protector updated.
     */
    public updateProtector(unit: Unit): void {
        // if it has no owner, cancel the function.
        if (unit.owner === undefined) {
            return;
        }
        // reset the units protector
        unit.protector = undefined;
        // all martyr ships owned by the player that can protect.
        const martyrs = unit.owner.units.filter(
            (u) => u.shield > 0 && u.job.title === "martyr",
        );
        // iterate over martyr that can protect.
        for (const martyr of martyrs) {
            // if the unit isn't protected and is in range.
            if (
                Math.sqrt(
                    (unit.x - martyr.x) ** 2 + (unit.y - martyr.y) ** 2,
                ) < martyr.job.range
            ) {
                // protected.
                unit.protector = martyr;

                // escape the function.
                return;
            }
        }
    }

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    /** Creates all the Jobs in the game. */
    private createJobs(): void {
        // push all three jobs.
        this.jobs.push(
            // adds the corvette job for ships.
            this.manager.create.job({
                title: "corvette",
                carryLimit: 0,
                damage: 20,
                energy: 100,
                moves: this.sizeX / 50,
                range: 100,
                unitCost: 100,
            }),

            // adds the missleboat ship job.
            this.manager.create.job({
                title: "missileboat",
                carryLimit: 0,
                damage: 100,
                energy: 100,
                moves: this.sizeX / 50,
                range: 500,
                unitCost: 100,
            }),

            // adds the martyr ship job.
            this.manager.create.job({
                title: "martyr",
                carryLimit: 0,
                damage: 0,
                energy: 100,
                moves: this.sizeX / 50,
                range: 105,
                unitCost: 150,
                shield: 100,
            }),

            // adds the transport ship job.
            this.manager.create.job({
                title: "transport",
                carryLimit: 100,
                damage: 0,
                energy: 50,
                moves: this.sizeX / 50,
                range: 100,
                unitCost: 75,
            }),

            // adds the miner ship job.
            this.manager.create.job({
                title: "miner",
                carryLimit: 20,
                damage: 0,
                energy: 100,
                moves: this.sizeX / 50,
                range: 100,
                unitCost: 150,
            }),
        );
    }

    /** Generates the map for testing. */
    private createMap(): void {
        // push all the bodies that are made in the generator.
        this.bodies.push(
            // adds the first players starting planet.
            this.manager.create.body({
                bodyType: "planet",
                owner: this.players[0],
                materialType: "none",
                radius: this.sizeY / 12,
                x: this.sizeX / 16,
                y: this.sizeY / 2,
                amount: this.planetEnergyCap,
                angle: -1,
                distance: -1,
            }),

            // adds the second players starting planet on the opposite side.
            this.manager.create.body({
                bodyType: "planet",
                owner: this.players[1],
                materialType: "none",
                radius: this.sizeY / 12,
                x: this.sizeX - this.sizeX / 16,
                y: this.sizeY / 2,
                amount: this.planetEnergyCap,
                angle: -1,
                distance: -1,
            }),

            // places a sun in the center of the map
            this.manager.create.body({
                bodyType: "sun",
                materialType: "none",
                radius: this.sizeY / 4,
                x: this.sizeX / 2,
                y: this.sizeY / 2,
                angle: -1,
                distance: -1,
            }),

            // places the victory point asteroid above the sun.
            this.manager.create.body({
                bodyType: "asteroid",
                materialType: "mythicite",
                amount: this.mythiciteAmount,
                radius: this.sizeY / 20,
                x: this.sizeX / 2,
                y: (this.sizeY * 3) / 4 + this.sizeY / 12,
                angle: 0,
                distance: this.sizeY / 4 + this.sizeY / 12,
            }),
        );

        // sets the home bases of the players.
        this.players[0].homeBase = this.bodies[0];
        this.players[1].homeBase = this.bodies[1];

        // genereates the asteroids with scaled sizes.
        this.generateAsteroids(100, this.sizeX / 100, this.sizeX / 50);

        // adds base units, 3 miners for each player.
        // add each players starting units.
        this.players[0].units.push(
            this.manager.create.unit({
                owner: this.players[0],
                job: this.jobs[4],
                radius: this.shipRadius,
                energy: 100,
                x: this.players[0].homeBase.x,
                y: this.players[0].homeBase.y,
            }),

            this.manager.create.unit({
                owner: this.players[0],
                job: this.jobs[4],
                radius: this.shipRadius,
                energy: 100,
                x: this.players[0].homeBase.x,
                y: this.players[0].homeBase.y,
            }),

            this.manager.create.unit({
                owner: this.players[0],
                job: this.jobs[4],
                radius: this.shipRadius,
                energy: 100,
                x: this.players[0].homeBase.x,
                y: this.players[0].homeBase.y,
            }),
        );

        this.players[1].units.push(
            this.manager.create.unit({
                owner: this.players[1],
                job: this.jobs[4],
                radius: this.shipRadius,
                energy: 100,
                x: this.players[1].homeBase.x,
                y: this.players[1].homeBase.y,
            }),

            this.manager.create.unit({
                owner: this.players[1],
                job: this.jobs[4],
                radius: this.shipRadius,
                energy: 100,
                x: this.players[1].homeBase.x,
                y: this.players[1].homeBase.y,
            }),

            this.manager.create.unit({
                owner: this.players[1],
                job: this.jobs[4],
                radius: this.shipRadius,
                energy: 100,
                x: this.players[1].homeBase.x,
                y: this.players[1].homeBase.y,
            }),
        );

        // add the untis to each player.
        for (const unit of this.players[0].units) {
            this.units.push(unit);
        }

        for (const unit of this.players[1].units) {
            this.units.push(unit);
        }
    }

    /**
     * Creates the asteroids on the map.
     * This function creates asteroids around the sun, and mirrors them
     * so there is a copy on the other side.
     *
     * @param amount - The number of asteroids to be generated.
     * @param minSize - The minimum size of a asteroid.
     * @param maxSize - The maximum size of a asteroid.
     */
    private generateAsteroids(
        amount: number,
        minSize: number,
        maxSize: number,
    ): void {
        // create lists to handle asteroid collision tracking and tracking the asteroids.
        let upper: Body[] = [];
        let lower: Body[] = [];

        // creates all of the asteroids.
        for (let i = 0; i < amount; i++) {
            // randomly generates the material based on rarity.
            const matNum = this.manager.random.int(0, 8);
            let material: "genarium" | "rarium" | "legendarium" | undefined;
            if (matNum < this.oreRarityGenarium) {
                material = "genarium";
            } else if (
                matNum <
                this.oreRarityGenarium + this.oreRarityRarium
            ) {
                material = "rarium";
            } else {
                material = "legendarium";
            }
            // places the asteroid in one of the sectors based on num for even distribution.
            if (i < amount / 2) {
                // generate the radius and distance
                const dist: number = Math.abs(
                    this.manager.random.float(
                        this.sizeY / 4 + this.sizeY / 18,
                        this.sizeY / 2.4,
                    ),
                );
                const ang: number = Math.abs(
                    this.manager.random.float(0, 22.5),
                );
                // make the new asteroid
                const ast: Body = this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: material,
                    amount: this.manager.random.int(
                        this.minAsteroid,
                        this.maxAsteroid + 1,
                    ),
                    radius: minSize,
                    angle: ang,
                    distance: dist,
                });
                // adds the asteroid.
                lower.push(ast);
            } else {
                // generate the radius and distance
                const dist: number = Math.abs(
                    this.manager.random.float(
                        this.sizeY / 4 + this.sizeY / 18,
                        this.sizeY / 2.4,
                    ),
                );
                const ang: number = Math.abs(
                    this.manager.random.float(22.5, 45),
                );
                // make the new asteroid
                const ast: Body = this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: material,
                    amount: this.manager.random.int(
                        this.minAsteroid,
                        this.maxAsteroid + 1,
                    ),
                    radius: minSize,
                    angle: ang,
                    distance: dist,
                });
                // adds the asteroid.
                upper.push(ast);
            }
        }

        // gets the x and y values for each asteroid.
        for (const asteroid of upper) {
            asteroid.x = asteroid.getX();
            asteroid.y = asteroid.getY();
        }

        // gets the x and y values for each asteroid.
        for (const asteroid of lower) {
            asteroid.x = asteroid.getX();
            asteroid.y = asteroid.getY();
        }

        // collides asteroids to get rid of overlap.
        upper = this.collideAsteroids(upper);

        // grows the asteroids as large as possible.
        this.growAsteroids(upper, minSize, maxSize);

        // collides the sectors together for proper mapping.
        lower = this.collideSectors(lower, upper, 0);
        lower = this.collideSectors(lower, upper, 45);

        // now collide lower in order to get a good fill.
        lower = this.collideAsteroids(lower);

        // now grow the asteroid after colliding them
        this.growAsteroids(lower, minSize, maxSize);

        // now shrink lower so it isn't colliding with the other sector.
        lower = this.collideSize(lower, upper, minSize, 0);
        lower = this.collideSize(lower, upper, minSize, 45);

        // taster tracker of all asteroids.
        const master: Body[] = [];

        // clones out the sectors to surround the sun.
        this.cloneAsteroids(master, lower);
        this.cloneAsteroids(master, upper);

        // grabs the victory point asteroid.
        const vAst = this.bodies[3];
        // removes any asteroids colliding into it by not adding them.
        for (const ast of master) {
            const dist = Math.sqrt(
                (ast.x - vAst.x) ** 2 + (ast.y - vAst.y) ** 2,
            );
            if (dist >= ast.radius + vAst.radius) {
                this.bodies.push(ast);
            } else if (dist >= vAst.radius + minSize) {
                ast.radius = minSize;
                this.bodies.push(ast);
            }
        }

        // exits the generator function.
        return;
    }

    /**
     * Function the tries to grow the asteroids to the set max size.
     *
     * @param asteroids - A list of the asteroids to be grown.
     * @param minSize - The minimum size that a asteroid will grow from.
     * @param maxSize - The maximum size that a asteroid will grow to.
     * @param preGrown - Tracks if some pregrowing has been done.
     */
    private growAsteroids(
        asteroids: Body[],
        minSize: number,
        maxSize: number,
        preGrown = false,
    ): void {
        // tracks which asteroids have grown.
        const grown: boolean[] = [];
        // tracks how many asteroids are done growing.
        let amtGrown = 0;

        // grows each asteroid and sets up the grown tracker.
        if (preGrown) {
            for (const asteroid of asteroids) {
                // if the asteroid hasn't already been grown.
                if (asteroid.radius === minSize) {
                    // make it isn't grown.
                    grown.push(false);
                } else {
                    // otherwise mark it as grown.
                    grown.push(true);
                }
            }
        } else {
            for (let x = 0; x < asteroids.length; x++) {
                // mark it isn't grown.
                grown.push(false);
            }
        }

        // as long as asteroids can still be grown, keep growing them.
        while (amtGrown < asteroids.length) {
            // grow each asteroid if it is valid to do so.
            for (let x = 0; x < asteroids.length; x++) {
                if (!grown[x] && asteroids[x].radius < maxSize) {
                    asteroids[x].radius += (maxSize - minSize) / 16;
                } else if (!grown[x]) {
                    grown[x] = true;
                    amtGrown++;
                }
            }

            // iterate over all of the asteroids.
            for (let x = 0; x < asteroids.length; x++) {
                // if it is already grown and thus didn't grown, move on.
                if (grown[x]) {
                    continue;
                }
                // grab the asteroid for ease of reference and readability.
                const sAst = asteroids[x];
                // iterate over the remaining asteroids.
                for (let y = 0; y < asteroids.length; y++) {
                    // make sure we don't try to collide a asteroid with it's self.
                    if (y === x) {
                        continue;
                    }
                    // grab the asteroid for ease of reference and readability.
                    const cAst = asteroids[y];
                    // if they collide, shrink them and end their growth.
                    if (
                        Math.sqrt(
                            (sAst.x - cAst.x) ** 2 + (sAst.y - cAst.y) ** 2,
                        ) <=
                        sAst.radius + cAst.radius
                    ) {
                        if (!grown[x]) {
                            grown.splice(x, 1, true);
                            // ungrow the asteroid.
                            asteroids[x].radius -= (maxSize - minSize) / 16;
                            // note the asteroid is done growing.
                            amtGrown++;
                        }
                        if (!grown[y]) {
                            grown.splice(y, 1, true);
                            // ungrow the asteroid.
                            asteroids[y].radius -= (maxSize - minSize) / 16;
                            // note the asteroid is done growing.
                            amtGrown++;
                        }
                    }
                }
            }
        }
    }

    /**
     * Function that handles collisions between asteroids. Removes asteroids
     * with the highest collision count.
     *
     * @param asteroids - A list of the asteroids to be grown.
     * @returns A list of the asteroids after the pruning.
     */
    private collideAsteroids(asteroids: Body[]): Body[] {
        // track the largest number of collisions.
        let largest = 0;
        // tracks valid asteroids.
        const valid: Body[] = [];
        // tracks collisions.
        const collide: number[][] = [];

        // initialize valid.
        for (let x = 0; x < asteroids.length; x++) {
            collide.push([]);
        }

        // iterate over each asteroid.
        for (let x = 0; x < asteroids.length; x++) {
            const sAst = asteroids[x];
            // iterate over the remaining asteroids.
            for (let y = x + 1; y < asteroids.length; y++) {
                const cAst = asteroids[y];
                // if they collide, note the collision.
                if (
                    Math.sqrt(
                        (sAst.x - cAst.x) ** 2 + (sAst.y - cAst.y) ** 2,
                    ) <=
                    sAst.radius + cAst.radius
                ) {
                    collide[x].push(y);
                    // update the largest number.
                    if (collide[x].length > largest) {
                        largest = collide[x].length;
                    }
                    collide[y].push(x);
                    // update the largest number.
                    if (collide[y].length > largest) {
                        largest = collide[y].length;
                    }
                }
            }
        }

        // remove the first asteroid with the largest number of collisions.
        for (let length = largest; length > 0; length--) {
            for (let x = 0; x < asteroids.length; x++) {
                if (collide[x].length === length) {
                    for (const col of collide[x]) {
                        if (collide[col] && collide[col].includes(x)) {
                            collide[col].splice(collide[col].indexOf(x), 1);
                        } else if (collide[col].includes(x)) {
                            collide.splice(x, 1);
                            break;
                        }
                    }
                }
            }
        }

        for (let x = 0; x < asteroids.length; x++) {
            if (collide[x].length === 0) {
                valid.push(asteroids[x]);
            }
        }

        // return the final list.
        return valid;
    }

    /**
     * This function takes in two lists of asteroids and the first list by the
     * designated amount and checks to see if they collide.
     * It removes the asteroids from the first list.
     *
     * @param s1 - The list of asteroids to be shifted and edited.
     * @param s2 - The list of asteroids to be compared to.
     * @param shift - The amount the copy of the first list will be shifted.
     * @returns The Body passed as `s2` returned and mutated.
     */
    private collideSectors(s1: Body[], s2: Body[], shift = 0): Body[] {
        // tracks the valid asteroids to be returned
        const valid: Body[] = [];
        // track any asteroids that collided
        const collide: boolean[] = [];

        // shift the asteroid and update it's location.
        for (const asteroid of s1) {
            collide.push(false);
            asteroid.angle += shift;
            asteroid.x = asteroid.getX();
            asteroid.y = asteroid.getY();
        }

        // iterate over all of the asteroids.
        for (const sAst of s2) {
            // iterate over the remaining asteroids.
            for (let y = 0; y < s1.length; y++) {
                // grab the asteroid for ease of reference and readability.
                const cAst = s1[y];
                // grab the distance for ease of use
                const dist = Math.sqrt(
                    (sAst.x - cAst.x) ** 2 + (sAst.y - cAst.y) ** 2,
                );
                // if they collide, shrink them and end their growth.
                if (dist <= sAst.radius + cAst.radius) {
                    // count the collision.
                    collide[y] = true;
                }
            }
        }

        // iterate over the shifted asteroids and un shift them.
        for (let x = 0; x < s1.length; x++) {
            // unshift the asteroid.
            s1[x].angle -= shift;
            s1[x].x = s1[x].getX();
            s1[x].y = s1[x].getY();
            // if the asteroid didn't collide, add it to the return.
            if (!collide[x]) {
                // add the asteroid to the output.
                valid.push(s1[x]);
            }
        }

        // return the final list
        return valid;
    }

    /**
     * This function takes in two lists of asteroids and the first list by the
     * designated amount and checks to see if they collide.
     * It removes the asteroids from the first list.
     *
     * @param s1 - This is the list of asteroids to be shifted and edited.
     * @param s2 - This is the list of asteroids to be compared to.
     * @param minSize - The minimum size of a asteroid.
     * @param shift - This is the amount the copy of the first list will be shifted.
     * @returns The Body passed in as `s2` now mutated.
     */
    private collideSize(
        s1: Body[],
        s2: Body[],
        minSize: number,
        shift = 0,
    ): Body[] {
        // tracks the valid asteroids to be returned
        const valid: Body[] = [];

        // shift the asteroid and update it's location.
        for (const asteroid of s1) {
            asteroid.angle += shift;
            asteroid.x = asteroid.getX();
            asteroid.y = asteroid.getY();
        }

        // iterate over all of the asteroids.
        for (const sAst of s2) {
            // iterate over the remaining asteroids.
            for (const cAst of s1) {
                // grab the distance for ease of use
                const dist = Math.sqrt(
                    (sAst.x - cAst.x) ** 2 + (sAst.y - cAst.y) ** 2,
                );
                // if they collide, shrink them and end their growth.
                while (dist <= sAst.radius + cAst.radius) {
                    // count the collision.
                    cAst.radius -= 2;
                }
            }
        }

        // iterate over the shifted asteroids and un shift them.
        for (const cAst of s1) {
            // unshift the asteroid.
            cAst.angle -= shift;
            cAst.x = cAst.getX();
            cAst.y = cAst.getY();
            // add it to the return.
            valid.push(cAst);
        }

        // return the final list
        return valid;
    }

    /**
     * This function clones the asteroids in the second list into the first list
     * with it's 8 rotations around the sun.
     *
     * @param master - The list to be added to.
     * @param clone - The list that is being cloned from.
     */
    private cloneAsteroids(master: Body[], clone: Body[]): void {
        // iterate over each of the asteroids to be clones.
        for (const ast of clone) {
            master.push(
                // add the base asteroid.
                ast,
                // add the base asteroid shifted by 45 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius,
                    angle: ast.angle + 45,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.angle + 45),
                    y: this.getY(ast.distance, ast.angle + 45),
                }),
                // add the base asteroid shifted by 90 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius,
                    angle: ast.angle + 90,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.angle + 90),
                    y: this.getY(ast.distance, ast.angle + 90),
                }),
                // add the base asteroid shifted by 135 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius,
                    angle: ast.angle + 135,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.angle + 135),
                    y: this.getY(ast.distance, ast.angle + 135),
                }),
                // add the base asteroid shifted by 180 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius,
                    angle: ast.angle + 180,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.angle + 180),
                    y: this.getY(ast.distance, ast.angle + 180),
                }),
                // add the base asteroid shifted by 225 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius,
                    angle: ast.angle + 225,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.angle + 225),
                    y: this.getY(ast.distance, ast.angle + 225),
                }),
                // add the base asteroid shifted by 270 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius,
                    angle: ast.angle + 270,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.angle + 270),
                    y: this.getY(ast.distance, ast.angle + 270),
                }),
                // add the base asteroid shifted by 315 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius,
                    angle: ast.angle + 315,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.angle + 315),
                    y: this.getY(ast.distance, ast.angle + 315),
                }),
            );
        }
    }

    /**
     * Gets the x value of the angle and distance.
     *
     * @param distance - The distance from the center.
     * @param angle - The angle from a top, like a rotated 90 degree to the
     * right unit circle.
     * @returns The x value at its distance and angle.
     */
    private getX(distance: number, angle: number): number {
        // gets the x location if there is a passed distance.
        if (distance >= 0 && angle >= 0) {
            return (
                distance * Math.cos(((angle + 90) / 180) * Math.PI) +
                this.bodies[2].x
            );
        } else {
            return -1;
        }
    }

    /**
     * Gets the y value of the angle and distance.
     *
     * @param distance - The distance from the center.
     * @param angle - The angle from a top, like a rotated 90 degree to the
     * right unit circle.
     * @returns The y value at it's distance and angle.
     */
    private getY(distance: number, angle: number): number {
        // gets the y location if there is a passed distance.
        if (distance >= 0 && angle >= 0) {
            return (
                distance * Math.sin(((angle + 90) / 180) * Math.PI) +
                this.bodies[2].y
            );
        } else {
            return -1;
        }
    }
    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}
