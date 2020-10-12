/** A ball to generate around. */
export interface Ball {
    /** The x position of the Ball. */
    x: number;
    /** The y position of the Ball. */
    y: number;
    /** The radius of the Ball. */
    r: number;
}

/** A generated ball. */
export interface BallGen {
    /** List of balls being generated. */
    balls: Ball[];
    /** The elasticity of the ball. */
    gooeyness: number;
    /** Water threshold for generation. */
    threshold: number;
    /** Grass threshold. */
    grassThreshold: number;
    /** Sea threshold. */
    seaThreshold: number;
}

/**
 * Creates a ball around islands.
 *
 * @param mapWidth - The width of the map.
 * @param mapHeight -  - The height of the map.
 * @param rng - The RNG function.
 * @returns A generated ball for the island.
 */
export function islandBalls(
    mapWidth: number,
    mapHeight: number,
    rng: () => number,
): BallGen {
    const balls: Ball[] = [];
    const minRadius = 0.5;
    const maxRadius = 1.5;
    const maxOffset = mapWidth * 0.2;
    const additionalBalls = 20;
    const radiusRange = maxRadius - minRadius;

    // Generate balls
    const islandX = mapWidth * 0.25 + 0.5;
    for (let i = 0; i < additionalBalls; i++) {
        balls.push({
            x: islandX + rng() * maxOffset * 2 - maxOffset,
            y: rng() * (mapHeight - 1) + 0.5,
            r: rng() * radiusRange + minRadius,
        });
    }

    return {
        balls,
        gooeyness: 1.0,
        threshold: 3.5,
        grassThreshold: 4.25,
        seaThreshold: 2.0,
    };
}

/**
 * Creates a ball around rivers.
 *
 * @param mapWidth - The width of the map.
 * @param mapHeight -  - The height of the map.
 * @param rng - The RNG function.
 * @returns A generated ball for the river.
 */
export function riverBalls(
    mapWidth: number,
    mapHeight: number,
    rng: () => number,
): BallGen {
    const balls: Ball[] = [];
    const minRadius = 0.5;
    const maxRadius = 4.0;
    const maxOffset = mapHeight / 2;
    const additionalBalls = 8;
    const radiusRange = maxRadius - minRadius;

    // Initial ball
    const islandX = 0.5;
    const islandY = rng() < 0.5 ? 0.5 : mapHeight - 0.5;
    balls.push({
        x: islandX,
        y: islandY,
        r: rng() * radiusRange + minRadius,
    });

    // Extra balls
    for (let i = 0; i < additionalBalls; i++) {
        balls.push({
            x: islandX,
            y: islandY + rng() * maxOffset * 2 - maxOffset,
            r: rng() * radiusRange + minRadius,
        });
    }

    return {
        balls,
        gooeyness: 0.95,
        threshold: 2.0,
        grassThreshold: 2.4,
        seaThreshold: 1.5,
    };
}

/**
 * Creates a ball around corners of the map.
 *
 * @param mapWidth - The width of the map.
 * @param mapHeight - The height of the map.
 * @param rng - The RNG function.
 * @returns A generated ball for the corner.
 */
export function cornerBalls(
    mapWidth: number,
    mapHeight: number,
    rng: () => number,
): BallGen {
    const balls: Ball[] = [];
    const minRadius = 0.75;
    const maxRadius = 1.25;
    const maxOffset = 10.0;
    const additionalBalls = 20;
    const radiusRange = maxRadius - minRadius;

    // Initial ball (top island)
    const islandX = 0.5;
    let islandY = 0.5;
    balls.push({
        x: islandX,
        y: islandY,
        r: rng() * radiusRange + minRadius,
    });

    // Extra balls (top island)
    for (let i = 0; i < additionalBalls; i++) {
        balls.push({
            x: islandX + rng() * maxOffset * 2 - maxOffset,
            y: islandY + rng() * maxOffset * 2 - maxOffset,
            r: rng() * radiusRange + minRadius,
        });
    }

    // Initial ball (bottom island)
    islandY = mapHeight - 0.5;
    balls.push({
        x: islandX,
        y: islandY,
        r: rng() * radiusRange + minRadius,
    });

    // Extra balls (bottom island)
    for (let i = 0; i < additionalBalls; i++) {
        balls.push({
            x: islandX + rng() * maxOffset * 2 - maxOffset,
            y: islandY - rng() * maxOffset,
            r: rng() * radiusRange + minRadius,
        });
    }

    return {
        balls,
        gooeyness: 1.0,
        threshold: 4.0,
        grassThreshold: 5.0,
        seaThreshold: 2.75,
    };
}
