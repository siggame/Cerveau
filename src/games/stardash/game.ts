import { IBaseGameRequiredData } from "~/core/game";
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
    /** The manager of this game, that controls everything around it */
    public readonly manager!: StardashGameManager;

    /** The settings used to initialize the game, as set by players */
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
     * Radius of the no dash zone around the sun.
     */
    public readonly dashBlock!: number;

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
     * used by the server and client to easily refer to the game objects via
     * ID.
     */
    public gameObjects!: {[id: string]: GameObject};

    /**
     * The value of every unit of genarium.
     */
    public readonly genariumValue!: number;

    /**
     * A list of all jobs. first item is corvette, second is missleboat, third
     * is martyr, fourth is transport, and fifth is miner.
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
     * stores mythicite that was lost via unit death.
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
        required: Readonly<IBaseGameRequiredData>,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>
        this.createJobs();

        this.createMap();
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    /** Creates all the Jobs in the game */
    private createJobs(): void {
        // push all three jobs.
        this.jobs.push(
            // adds the corvette job for ships.
            this.manager.create.job({
                title: "corvette",
                carryLimit: 0,
                damage: 10,
                health: 100,
                moves: this.sizeX / 50,
                range: 100,
                unitCost: 100,
            }),

            // adds the missleboat ship job.
            this.manager.create.job({
                title: "missleboat",
                carryLimit: 0,
                damage: 100,
                health: 100,
                moves: this.sizeX / 50,
                range: 300,
                unitCost: 125,
            }),

            // adds the martyr ship job.
            this.manager.create.job({
                title: "martyr",
                carryLimit: 0,
                damage: 0,
                health: 100,
                moves: this.sizeX / 50,
                range: 105,
                unitCost: 150,
                shield: 1000,
            }),

            // adds the transport ship job.
            this.manager.create.job({
                title: "transport",
                carryLimit: 100,
                damage: 0,
                health: 100,
                moves: this.sizeX / 50,
                range: 100,
                unitCost: 75,
            }),

            // adds the miner ship job.
            this.manager.create.job({
                title: "miner",
                carryLimit: 20,
                damage: 0,
                health: 100,
                moves: this.sizeX / 50,
                range: 100,
                unitCost: 75,
            }),
        );
    }

    /** Generates the map for testing */
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
            }),

            // adds the second players starting planet on the opposite side.
            this.manager.create.body({
                bodyType: "planet",
                owner: this.players[1],
                materialType: "none",
                radius: this.sizeY / 12,
                x: this.sizeX - (this.sizeX / 16),
                y: this.sizeY / 2,
                amount: this.planetEnergyCap,
            }),

            // places a sun in the center of the map
            this.manager.create.body({
                bodyType: "sun",
                materialType: "none",
                radius: this.sizeY / 4,
                x: this.sizeX / 2,
                y: this.sizeY / 2,
            }),

            // places the victory point asteroid above the sun.
            this.manager.create.body({
                bodyType: "asteroid",
                materialType: "mythicite",
                radius: 90,
                x: this.sizeX / 2,
                y: (this.sizeY * 29) / 36,
                angle: 0,
            }),
        );

        // sets the home bases of the players.
        this.players[0].homeBase = this.bodies[0];
        this.players[1].homeBase = this.bodies[1];

        // genereates the asteroids with scaled sizes.
        this.generateAsteroids(50, this.sizeX / 128, this.sizeX / 40);

        // adds base units, 3 miners for each player.
        // list for each player
        const player0: Unit[] = [];
        const player1: Unit[] = [];

        // add each players starting units.
        player0.push(
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

        player1.push(
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
        for (const unit of player0) {
            this.units.push(unit);
        }

        for (const unit of player1) {
            this.units.push(unit);
        }
    }

    /**
     * Creates the asteroids on the map.
     * This function creates asteroids around the sun, and mirrors them
     * so there is a copy on the other side.
     * @param amount: the number of asteroids to be generated.
     * @param minSize: the minimum size of a asteroid.
     * @param maxSize: the maximum size of a asteroid.
     */
    private generateAsteroids(amount: number, minSize: number, maxSize: number): void {
        // create lists to handle asteroid collision tracking and tracking the asteroids.
        const upper: Body[] = [];
        const upperCol: number[] = [];
        const lower: Body[] = [];
        const lowerCol: number[] = [];

        // creates all of the asteroids.
        for (let i = 0; i < amount; i++) {
            // randomly generates the material based on rarity.
            const matNum = this.manager.random.int(0, 8);
            let material: "genarium" | "rarium" | "legendarium" | undefined;
            if (matNum < this.oreRarityGenarium) {
                material = "genarium";
            }
            else if (matNum < this.oreRarityGenarium + this.oreRarityRarium) {
                material = "rarium";
            }
            else {
                material = "legendarium";
            }
            // places the asteroid in one of the sectors based on num for even distribution.
            if (i < amount / 2) {
                // adds the collision tracker.
                upperCol.push(0);
                // adds the asteroid.
                upper.push(
                    this.manager.create.body({
                        bodyType: "asteroid",
                        materialType: material,
                        amount: this.manager.random.int(this.minAsteroid, this.maxAsteroid + 1),
                        radius: minSize,
                        angle: this.manager.random.float(0, 22.5),
                        distance: this.manager.random.float(this.sizeY / 3.6, (this.sizeY / 3.6) + (this.sizeY / 9)),
                    }),
                );
            }
            else {
                // adds the collision tracker.
                lowerCol.push(0);
                // adds the asteroid.
                lower.push(
                    this.manager.create.body({
                        bodyType: "asteroid",
                        materialType: material,
                        amount: this.manager.random.int(this.minAsteroid, this.maxAsteroid + 1),
                        radius: minSize,
                        angle: this.manager.random.float(22.5, 45),
                        distance: this.manager.random.float(this.sizeY / 3.6, (this.sizeY / 3.6) + (this.sizeY / 9)),
                    }),
                );
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
        this.collideAsteroids(lower, lowerCol, maxSize);
        this.collideAsteroids(upper, upperCol, maxSize);

        // grows the asteroids as large as possible.
        this.growAsteroids(lower, maxSize);
        this.growAsteroids(upper, maxSize);

        // collides the sectors together for proper mapping.
        this.collideSectors(lower, upper, 0);
        this.collideSectors(lower, upper, 45);

        // taster tracker of all asteroids.
        const master: Body[] = [];

        // clones out the sectors to surround the sun.
        this.cloneAsteroids(master, lower);
        this.cloneAsteroids(master, upper);

        // grabs the victory point asteroid.
        const vAst = this.bodies[3];
        // removes any asteroids colliding into it by not adding them.
        for (const ast of master) {
            if (Math.sqrt(((ast.x - vAst.x) ** 2) + ((ast.y - vAst.y) ** 2)) >= ast.radius + vAst.radius) {
                this.bodies.push(ast);
            }
        }

        // exits the generator function.
        return;
    }

    /**
     * Function the tries to grow the asteroids to the set max size.
     *
     * @param asteroids: a list of the asteroids to be grown.
     * @param maxSize: the maximum size that a asteroid will grow to.
     *
     * @returns: nothing, it edits the asteroids, and will remove collisions.
     */
    private growAsteroids(asteroids: Body[], maxSize: number): void {
        // tracks which asteroids have grown.
        const grown: boolean[] = [];
        // tracks how many asteroids are done growing.
        let amtGrown: number = 0;

        // grows each asteroid and sets up the grown tracker.
        for (const asteroid of asteroids) {
            grown.push(false);
            asteroid.radius += maxSize / 5;
        }

        // as long as asteroids can still be grown, keep growing them.
        while (amtGrown < asteroids.length) {
            // grow each asteroid if it is valid to do so.
            for (let x = 0; x < asteroids.length; x++) {
                if (!grown[x] && asteroids[x].radius < maxSize) {
                    asteroids[x].radius += maxSize / 5;
                }
            }

            // iterate over all of the asteroids.
            for (let x = 0; x < asteroids.length; x++) {
                const sAst = asteroids[x];
                // iterate over the remaining asteroids.
                for (let y = x; y < asteroids.length; y++) {
                    const cAst = asteroids[y];
                    // if they collide, shrink them and end their growth.
                    if (Math.sqrt(((sAst.x - cAst.x) ** 2) + ((sAst.y - cAst.y) ** 2)) < sAst.radius + cAst.radius) {
                        asteroids[x].radius -= maxSize / 5;
                        asteroids[y].radius -= maxSize / 5;
                        if (!grown[x]) {
                            grown.splice(x, 1, true);
                            // note the asteroid is done growing.
                            amtGrown++;
                        }
                        if (!grown[y]) {
                            grown.splice(y, 1, true);
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
     * @param asteroids: a list of the asteroids to be grown.
     * @param collide: a tracker list to count collisions.
     * @param maxSize: the maximum size that a asteroid will grow to.
     *
     * @returns: nothing, it edits the asteroids, and will remove collisions.
     */
    private collideAsteroids(asteroids: Body[], collide: number[], maxSize: number): void {
        // track the largest number of collisions.
        let largest = 0;
        // track if there were any collisions.
        let found = false;

        // iterate over each asteroid.
        for (let x = 0; x < asteroids.length; x++) {
            const sAst = asteroids[x];
            // iterate over the remaining asteroids.
            for (let y = x; y < asteroids.length; y++) {
                const cAst = asteroids[y];
                // if they collide, note the collision.
                if (Math.sqrt(((sAst.x - cAst.x) ** 2) + ((sAst.y - cAst.y) ** 2)) < sAst.radius + cAst.radius) {
                    found = true;
                    collide[x] += 1;
                    // update the largest number.
                    if (collide[x] > largest) {
                        largest = collide[x];
                    }
                    collide[y] += 1;
                    if (collide[y] > largest) {
                        largest = collide[y];
                    }
                }
            }
        }

        // remove the first asteroid with the largest number of collisions.
        for (let x = 0; x < asteroids.length; x++) {
            if (collide[x] === largest) {
                asteroids.splice(x, 1);
                collide.splice(x, 1);
                break;
            }
        }

        // if it isn't done, recursively call this function.
        if (found) {
            // reset collision tracker.
            for (let x = 0; x < collide.length; x++) {
                collide[x] = 0;
            }
            this.collideAsteroids(asteroids, collide, maxSize);
        }
    }

    /**
     * This function takes in two lists of asteroids and the first list by the
     * designated amount and checks to see if they collide.
     * It removes the asteroids from the first list.
     *
     * @param s1: this is the list of asteroids to be shifted and edited.
     * @param s2: this is the list of asteroids to be compared to.
     * @param shift: this is the amount the copy of the first list will be shifted
     *
     * @returns: it edits s2.
     */
    private collideSectors(s1: Body[], s2: Body[], shift: number): void {
        // shift the asteroid and update it's location.
        for (const asteroid of s1) {
            if (asteroid.angle !== undefined) {
                asteroid.angle += shift;
                asteroid.x = asteroid.getX();
                asteroid.y = asteroid.getY();
            }
        }

        // iterates over every non shifted asteroid.
        for (const ast of s2) {
            // iterates over the shifted asteroids.
            for (let x = 0; x < s1.length; x++) {
                // if they collide, remove it.
                if (Math.sqrt(((ast.x - s1[x].x) ** 2) + ((ast.y - s1[x].y) ** 2)) < ast.radius + s1[x].radius) {
                    s1.splice(x, 1);
                    // back up to account for the removed asteroid.
                    x--;
                }
            }
        }

        // iterate over the shifted asteroids and un shift them.
        for (const asteroid of s1) {
            if (asteroid.angle !== undefined) {
                asteroid.angle -= shift;
                asteroid.x = asteroid.getX();
                asteroid.y = asteroid.getY();
            }
        }
    }

    /**
     * this function clones the asteroids in the second list into the first list
     * with it's 8 rotations around the sun.
     *
     * @param master: The list to be added to.
     * @param clone: the list that is being cloned from.
     *
     * @returns: it adds the rotations of list two into list one.
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
                    radius: ast.radius + 45,
                    angle: ast.angle,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.radius + 45),
                    y: this.getY(ast.distance, ast.radius + 45),
                }),
                // add the base asteroid shifted by 90 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius + 90,
                    angle: ast.angle,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.radius + 90),
                    y: this.getY(ast.distance, ast.radius + 90),
                }),
                // add the base asteroid shifted by 135 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius + 135,
                    angle: ast.angle,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.radius + 135),
                    y: this.getY(ast.distance, ast.radius + 135),
                }),
                // add the base asteroid shifted by 180 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius + 180,
                    angle: ast.angle,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.radius + 180),
                    y: this.getY(ast.distance, ast.radius + 180),
                }),
                // add the base asteroid shifted by 225 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius + 225,
                    angle: ast.angle,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.radius + 225),
                    y: this.getY(ast.distance, ast.radius + 225),
                }),
                // add the base asteroid shifted by 270 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius + 270,
                    angle: ast.angle,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.radius + 270),
                    y: this.getY(ast.distance, ast.radius + 270),
                }),
                // add the base asteroid shifted by 315 degrees.
                this.manager.create.body({
                    bodyType: "asteroid",
                    materialType: ast.materialType,
                    amount: ast.amount,
                    radius: ast.radius + 315,
                    angle: ast.angle,
                    distance: ast.distance,
                    x: this.getX(ast.distance, ast.radius + 315),
                    y: this.getY(ast.distance, ast.radius + 315),
                }),
            );
        }
    }

    /**
     * Gets the x value of the angle and distance.
     *
     * @param distance: the distance from the center.
     * @param angle: the angle from a top, like a rotated 90 degree to the right
     * unit circle.
     *
     * @returns the x value at it's distance and angle
     */
    private getX(distance: number | undefined, angle: number | undefined): number {
        // gets the x location if there is a passed distance.
        if (distance && angle) {
            return distance * Math.cos((angle / 180) * Math.PI);
        }
        else {
            return -1;
        }
    }

    /**
     * Gets the y value of the angle and distance.
     *
     * @param distance: the distance from the center.
     * @param angle: the angle from a top, like a rotated 90 degree to the right
     * unit circle.
     *
     * @returns the y value at it's distance and angle
     */
    private getY(distance: number | undefined, angle: number | undefined): number {
        // gets the y location if there is a passed distance.
        if (distance && angle) {
            return distance * Math.sin((angle / 180) * Math.PI);
        }
        else {
            return -1;
        }
    }
    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}
