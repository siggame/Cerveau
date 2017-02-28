// Note: You should never modify this file... probably.

var serializer = require(__basedir + "/gameplay/serializer");

var classes = {};

classes.Game = require("./game");

classes.Game._deltaMergeableProperties = {
    beavers: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Beaver", "valueType": null}},
        defaultValue: [],
    },

    branchesToCompleteLodge: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    currentPlayer: {
        type: {"is_game_object": true, "keyType": null, "name": "Player", "valueType": null},
        defaultValue: null,
    },

    currentTurn: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    freeBeaversCount: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    gameObjects: {
        type: {"is_game_object": false, "keyType": {"is_game_object": false, "keyType": null, "name": "string", "valueType": null}, "name": "dictionary", "valueType": {"is_game_object": true, "keyType": null, "name": "GameObject", "valueType": null}},
        defaultValue: {},
    },

    jobs: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Job", "valueType": null}},
        defaultValue: [],
    },

    lodgesCompleteToWin: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    mapHeight: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    mapWidth: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    maxTurns: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 100,
    },

    players: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Player", "valueType": null}},
        defaultValue: [],
    },

    session: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    spawner: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Spawner", "valueType": null}},
        defaultValue: [],
    },

    spawnerTypes: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": false, "keyType": null, "name": "string", "valueType": null}},
        defaultValue: [],
    },

    tiles: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null}},
        defaultValue: [],
    },

};


classes.Game.aiFinishedRunTurn.cerveau = {
    args: [
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: true,
    },
};

//<<-- Creer-Merge: secret-Game -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Game -->>


classes.Beaver = require("./beaver");

classes.Beaver._deltaMergeableProperties = {
    actions: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    branches: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    distracted: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    fish: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    health: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    job: {
        type: {"is_game_object": true, "keyType": null, "name": "Job", "valueType": null},
        defaultValue: null,
    },

    moves: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    owner: {
        type: {"is_game_object": true, "keyType": null, "name": "Player", "valueType": null},
        defaultValue: null,
    },

    tile: {
        type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        defaultValue: null,
    },

};


classes.Beaver.attack.cerveau = {
    args: [
        {
            name: "tile",
            type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
};

classes.Beaver.buildLodge.cerveau = {
    args: [
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
};

classes.Beaver.drop.cerveau = {
    args: [
        {
            name: "resource",
            type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        },
        {
            name: "amount",
            type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
            defaultValue: 0,
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
};

classes.Beaver.harvest.cerveau = {
    args: [
        {
            name: "tile",
            type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
};

classes.Beaver.move.cerveau = {
    args: [
        {
            name: "tile",
            type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
};

classes.Beaver.pickup.cerveau = {
    args: [
        {
            name: "resource",
            type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        },
        {
            name: "amount",
            type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
            defaultValue: 0,
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
};

//<<-- Creer-Merge: secret-Beaver -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Beaver -->>


classes.GameObject = require("./gameObject");

classes.GameObject._deltaMergeableProperties = {
    gameObjectName: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    id: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    logs: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": false, "keyType": null, "name": "string", "valueType": null}},
        defaultValue: [],
    },

};


classes.GameObject.log.cerveau = {
    args: [
        {
            name: "message",
            type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        },
    ],
    returns: undefined,
};

//<<-- Creer-Merge: secret-GameObject -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-GameObject -->>


classes.Job = require("./job");

classes.Job._deltaMergeableProperties = {
    actions: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    carryLimit: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    chopping: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    cost: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    damage: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    distracts: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    fishing: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    health: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    moves: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    title: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

};


classes.Job.recruit.cerveau = {
    args: [
        {
            name: "lodge",
            type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": true, "keyType": null, "name": "Beaver", "valueType": null},
        defaultValue: null,
    },
};

//<<-- Creer-Merge: secret-Job -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Job -->>


classes.Player = require("./player");

classes.Player._deltaMergeableProperties = {
    beavers: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Beaver", "valueType": null}},
        defaultValue: [],
    },

    branchesToBuildLodge: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    clientType: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    lodges: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null}},
        defaultValue: [],
    },

    lost: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    name: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "Anonymous",
    },

    opponent: {
        type: {"is_game_object": true, "keyType": null, "name": "Player", "valueType": null},
        defaultValue: null,
    },

    reasonLost: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    reasonWon: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    timeRemaining: {
        type: {"is_game_object": false, "keyType": null, "name": "float", "valueType": null},
        defaultValue: 0,
    },

    won: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

};


//<<-- Creer-Merge: secret-Player -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Player -->>


classes.Spawner = require("./spawner");

classes.Spawner._deltaMergeableProperties = {
    health: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    tile: {
        type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        defaultValue: null,
    },

    type: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

};


//<<-- Creer-Merge: secret-Spawner -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Spawner -->>


classes.Tile = require("./tile");

classes.Tile._deltaMergeableProperties = {
    beaver: {
        type: {"is_game_object": true, "keyType": null, "name": "Beaver", "valueType": null},
        defaultValue: null,
    },

    branches: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    fish: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    flowDirection: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    lodgeOwner: {
        type: {"is_game_object": true, "keyType": null, "name": "Player", "valueType": null},
        defaultValue: null,
    },

    spawner: {
        type: {"is_game_object": true, "keyType": null, "name": "Spawner", "valueType": null},
        defaultValue: null,
    },

    tileEast: {
        type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        defaultValue: null,
    },

    tileNorth: {
        type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        defaultValue: null,
    },

    tileSouth: {
        type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        defaultValue: null,
    },

    tileWest: {
        type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        defaultValue: null,
    },

    type: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    x: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    y: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

};


//<<-- Creer-Merge: secret-Tile -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Tile -->>


// Hook up the game's internal classes that we just finished initializing
classes.Game.classes = classes;
classes.Game.prototype.classes = classes;

module.exports = classes.Game;
