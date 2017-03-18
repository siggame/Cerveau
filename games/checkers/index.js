// Note: You should never modify this file... probably.

var serializer = require(__basedir + "/gameplay/serializer");

var classes = {};

classes.Game = require("./game");

classes.Game._deltaMergeableProperties = {
    boardHeight: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 8,
    },

    boardWidth: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 8,
    },

    checkerMoved: {
        type: {"is_game_object": true, "keyType": null, "name": "Checker", "valueType": null},
        defaultValue: null,
    },

    checkerMovedJumped: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    checkers: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Checker", "valueType": null}},
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

    gameObjects: {
        type: {"is_game_object": false, "keyType": {"is_game_object": false, "keyType": null, "name": "string", "valueType": null}, "name": "dictionary", "valueType": {"is_game_object": true, "keyType": null, "name": "GameObject", "valueType": null}},
        defaultValue: {},
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

};


classes.Game.aiFinishedGotCaptured.cerveau = {
    args: [
        {
            name: "checker",
            type: {"is_game_object": true, "keyType": null, "name": "Checker", "valueType": null},
        },
    ],
    returns: undefined,
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


classes.Checker = require("./checker");

classes.Checker._deltaMergeableProperties = {
    kinged: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    owner: {
        type: {"is_game_object": true, "keyType": null, "name": "Player", "valueType": null},
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


classes.Checker.isMine.cerveau = {
    invalidate: classes.Checker.invalidateIsMine,
    args: [
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
    invalidValue: false,
};

classes.Checker.move.cerveau = {
    invalidate: classes.Checker.invalidateMove,
    args: [
        {
            name: "x",
            type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        },
        {
            name: "y",
            type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": true, "keyType": null, "name": "Checker", "valueType": null},
        defaultValue: null,
    },
    invalidValue: null,
};

//<<-- Creer-Merge: secret-Checker -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Checker -->>


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
    invalidate: classes.GameObject.invalidateLog,
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
    checkers: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Checker", "valueType": null}},
        defaultValue: [],
    },

    clientType: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
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

    yDirection: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

};


//<<-- Creer-Merge: secret-Player -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Player -->>


// Hook up the game's internal classes that we just finished initializing
classes.Game.classes = classes;
classes.Game.prototype.classes = classes;

module.exports = classes.Game;
