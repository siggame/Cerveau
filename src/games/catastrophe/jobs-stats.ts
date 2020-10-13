import { JobProperties } from "./";

/** The default stats for each job if not overridden. */
const defaultJobStats: JobProperties = {
    actionCost: 75,
    carryLimit: 10,
    moves: 4,
    regenRate: 50,
    upkeep: 2,
};

/** The stats for each job in the Catastrophe game. */
export const jobStats: { [jobName: string]: JobProperties } = {
    "fresh human": {
        actionCost: 0,
        upkeep: 1,
    },
    "cat overlord": {
        carryLimit: 10,
        moves: 2,
        regenRate: 10,
        upkeep: 0,
    },
    soldier: {
        actionCost: 25,
        moves: 3,
        regenRate: 25,
        upkeep: 3,
    },
    gatherer: {
        carryLimit: 100,
        upkeep: 1,
    },
    builder: {
        carryLimit: 75,
    },
    missionary: {},
};

// Inject the default values into each job's stats.
for (const [jobName, jobStat] of Object.entries(jobStats)) {
    jobStats[jobName] = {
        ...defaultJobStats,
        ...jobStat,
    };
}
