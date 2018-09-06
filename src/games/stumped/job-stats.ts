import { IJobProperties } from "./";

/** The default stats for each job if not overridden */
const defaultJobStats: IJobProperties = {
    cost: 3,
    damage: 1,
    health: 3,
    moves: 3,
    actions: 1,
    chopping: 1,
    munching: 1,
    carryLimit: 3,
    distractionPower: 0,
};

/** The job stats for each Job, indexed by job name. */
export const jobStats: { [jobName: string]: IJobProperties } = {
    "Basic": {},
    "Fighter": {
        cost: 12,
        damage: 3,
        health: 4,
        moves: 2,
        carryLimit: 6,
    },
    "Bulky": {
        cost: 12,
        damage: 2,
        health: 10,
        moves: 2,
        carryLimit: 2,
    },
    "Hungry": {
        cost: 8,
        munching: 3,
        distractionPower: 1,
        carryLimit: 15,
    },
    "Swift": {
        cost: 6,
        munching: 2,
        moves: 5,
        carryLimit: 2,
    },
    "Hot Lady": {
        cost: 15,
        distractionPower: 3,
        carryLimit: 1,
    },
    "Builder": {
        cost: 6,
        chopping: 3,
        carryLimit: 15,
    },
};

// Inject the default values into each job's stats.
for (const [jobName, jobStat] of Object.entries(jobStats)) {
    jobStats[jobName] = {
        ...defaultJobStats,
        ...jobStat,
    };
}
