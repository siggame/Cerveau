// Note: You should never modify this file... probably.

var serializer = require(__basedir + "/gameplay/serializer");

var classes = {};

classes.Game = require("./game");

classes.Game._deltaMergeableProperties = {
    bottles: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Bottle", "valueType": null}},
        defaultValue: [],
    },

    cowboys: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Cowboy", "valueType": null}},
        defaultValue: [],
    },

    currentPlayer: {
        type: {"is_game_object": true, "keyType": null, "name": "Player", "valueType": null},
        defaultValue: null,
    },

    currentTurn: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    furnishings: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Furnishing", "valueType": null}},
        defaultValue: [],
    },

    gameObjects: {
        type: {"is_game_object": false, "keyType": {"is_game_object": false, "keyType": null, "name": "string", "valueType": null}, "name": "dictionary", "valueType": {"is_game_object": true, "keyType": null, "name": "GameObject", "valueType": null}},
        defaultValue: {},
    },

    jobs: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": false, "keyType": null, "name": "string", "valueType": null}},
        defaultValue: [],
    },

    mapHeight: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    mapWidth: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    maxCowboys: {
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

    rowdynessToSiesta: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    session: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    siestaLength: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
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


classes.Bottle = require("./bottle");

classes.Bottle._deltaMergeableProperties = {
    direction: {
        type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        defaultValue: null,
    },

    drunkDirection: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    isDestroyed: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    tile: {
        type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        defaultValue: null,
    },

};


//<<-- Creer-Merge: secret-Bottle -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Bottle -->>


classes.Cowboy = require("./cowboy");

classes.Cowboy._deltaMergeableProperties = {
    canMove: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    drunkDirection: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    focus: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    health: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    isDead: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    isDrunk: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    job: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    owner: {
        type: {"is_game_object": true, "keyType": null, "name": "Player", "valueType": null},
        defaultValue: null,
    },

    tile: {
        type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        defaultValue: null,
    },

    tolerance: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    turnsBusy: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

};


classes.Cowboy.act.cerveau = {
    args: [
        {
            name: "tile",
            type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        },
        {
            name: "drunkDirection",
            type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
            defaultValue: "",
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
};

classes.Cowboy.move.cerveau = {
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

classes.Cowboy.play.cerveau = {
    args: [
        {
            name: "piano",
            type: {"is_game_object": true, "keyType": null, "name": "Furnishing", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
};

//<<-- Creer-Merge: secret-Cowboy -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Cowboy -->>


classes.Furnishing = require("./furnishing");

classes.Furnishing._deltaMergeableProperties = {
    health: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    isDestroyed: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    isPiano: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    tile: {
        type: {"is_game_object": true, "keyType": null, "name": "Tile", "valueType": null},
        defaultValue: null,
    },

};


//<<-- Creer-Merge: secret-Furnishing -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Furnishing -->>


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


classes.Player = require("./player");

classes.Player._deltaMergeableProperties = {
    clientType: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    cowboys: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Cowboy", "valueType": null}},
        defaultValue: [],
    },

    kills: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
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

    rowdyness: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    score: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    siesta: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    timeRemaining: {
        type: {"is_game_object": false, "keyType": null, "name": "float", "valueType": null},
        defaultValue: 0,
    },

    won: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    youngGun: {
        type: {"is_game_object": true, "keyType": null, "name": "Cowboy", "valueType": null},
        defaultValue: null,
    },

};


classes.Player.sendIn.cerveau = {
    args: [
        {
            name: "job",
            type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": true, "keyType": null, "name": "Cowboy", "valueType": null},
        defaultValue: null,
    },
};

//<<-- Creer-Merge: secret-Player -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Player -->>


classes.Tile = require("./tile");

classes.Tile._deltaMergeableProperties = {
    bottle: {
        type: {"is_game_object": true, "keyType": null, "name": "Bottle", "valueType": null},
        defaultValue: null,
    },

    cowboy: {
        type: {"is_game_object": true, "keyType": null, "name": "Cowboy", "valueType": null},
        defaultValue: null,
    },

    furnishing: {
        type: {"is_game_object": true, "keyType": null, "name": "Furnishing", "valueType": null},
        defaultValue: null,
    },

    hasHazard: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    isWall: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
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
