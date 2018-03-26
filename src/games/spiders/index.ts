// Note: You should never modify this file... probably.

var serializer = require(__basedir + "/gameplay/serializer");

var classes = {};

classes.Game = require("./game");

classes.Game._deltaMergeableProperties = {
    currentPlayer: {
        type: {"is_game_object": true, "keyType": null, "name": "Player", "valueType": null},
        defaultValue: null,
    },

    currentTurn: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    cutSpeed: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    eggsScalar: {
        type: {"is_game_object": false, "keyType": null, "name": "float", "valueType": null},
        defaultValue: 0,
    },

    gameObjects: {
        type: {"is_game_object": false, "keyType": {"is_game_object": false, "keyType": null, "name": "string", "valueType": null}, "name": "dictionary", "valueType": {"is_game_object": true, "keyType": null, "name": "GameObject", "valueType": null}},
        defaultValue: {},
    },

    initialWebStrength: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    maxTurns: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 100,
    },

    movementSpeed: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    nests: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Nest", "valueType": null}},
        defaultValue: [],
    },

    players: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Player", "valueType": null}},
        defaultValue: [],
    },

    session: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    spitSpeed: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    weavePower: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    weaveSpeed: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    webs: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Web", "valueType": null}},
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


classes.BroodMother = require("./broodMother");

classes.BroodMother._deltaMergeableProperties = {
    eggs: {
        type: {"is_game_object": false, "keyType": null, "name": "float", "valueType": null},
        defaultValue: 0,
    },

    health: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

};


classes.BroodMother.consume.cerveau = {
    invalidate: classes.BroodMother.invalidateConsume,
    args: [
        {
            name: "spiderling",
            type: {"is_game_object": true, "keyType": null, "name": "Spiderling", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
    invalidValue: false,
};

classes.BroodMother.spawn.cerveau = {
    invalidate: classes.BroodMother.invalidateSpawn,
    args: [
        {
            name: "spiderlingType",
            type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": true, "keyType": null, "name": "Spiderling", "valueType": null},
        defaultValue: null,
    },
    invalidValue: null,
};

//<<-- Creer-Merge: secret-BroodMother -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-BroodMother -->>


classes.Cutter = require("./cutter");

classes.Cutter._deltaMergeableProperties = {
    cuttingWeb: {
        type: {"is_game_object": true, "keyType": null, "name": "Web", "valueType": null},
        defaultValue: null,
    },

};


classes.Cutter.cut.cerveau = {
    invalidate: classes.Cutter.invalidateCut,
    args: [
        {
            name: "web",
            type: {"is_game_object": true, "keyType": null, "name": "Web", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
    invalidValue: false,
};

//<<-- Creer-Merge: secret-Cutter -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Cutter -->>


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


classes.Nest = require("./nest");

classes.Nest._deltaMergeableProperties = {
    spiders: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Spider", "valueType": null}},
        defaultValue: [],
    },

    webs: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Web", "valueType": null}},
        defaultValue: [],
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


//<<-- Creer-Merge: secret-Nest -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Nest -->>


classes.Player = require("./player");

classes.Player._deltaMergeableProperties = {
    broodMother: {
        type: {"is_game_object": true, "keyType": null, "name": "BroodMother", "valueType": null},
        defaultValue: null,
    },

    clientType: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    lost: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    maxSpiderlings: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
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

    spiders: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Spider", "valueType": null}},
        defaultValue: [],
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


classes.Spider = require("./spider");

classes.Spider._deltaMergeableProperties = {
    isDead: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },

    nest: {
        type: {"is_game_object": true, "keyType": null, "name": "Nest", "valueType": null},
        defaultValue: null,
    },

    owner: {
        type: {"is_game_object": true, "keyType": null, "name": "Player", "valueType": null},
        defaultValue: null,
    },

};


//<<-- Creer-Merge: secret-Spider -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Spider -->>


classes.Spiderling = require("./spiderling");

classes.Spiderling._deltaMergeableProperties = {
    busy: {
        type: {"is_game_object": false, "keyType": null, "name": "string", "valueType": null},
        defaultValue: "",
    },

    movingOnWeb: {
        type: {"is_game_object": true, "keyType": null, "name": "Web", "valueType": null},
        defaultValue: null,
    },

    movingToNest: {
        type: {"is_game_object": true, "keyType": null, "name": "Nest", "valueType": null},
        defaultValue: null,
    },

    numberOfCoworkers: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    workRemaining: {
        type: {"is_game_object": false, "keyType": null, "name": "float", "valueType": null},
        defaultValue: 0,
    },

};


classes.Spiderling.attack.cerveau = {
    invalidate: classes.Spiderling.invalidateAttack,
    args: [
        {
            name: "spiderling",
            type: {"is_game_object": true, "keyType": null, "name": "Spiderling", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
    invalidValue: false,
};

classes.Spiderling.move.cerveau = {
    invalidate: classes.Spiderling.invalidateMove,
    args: [
        {
            name: "web",
            type: {"is_game_object": true, "keyType": null, "name": "Web", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
    invalidValue: false,
};

//<<-- Creer-Merge: secret-Spiderling -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Spiderling -->>


classes.Spitter = require("./spitter");

classes.Spitter._deltaMergeableProperties = {
    spittingWebToNest: {
        type: {"is_game_object": true, "keyType": null, "name": "Nest", "valueType": null},
        defaultValue: null,
    },

};


classes.Spitter.spit.cerveau = {
    invalidate: classes.Spitter.invalidateSpit,
    args: [
        {
            name: "nest",
            type: {"is_game_object": true, "keyType": null, "name": "Nest", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
    invalidValue: false,
};

//<<-- Creer-Merge: secret-Spitter -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Spitter -->>


classes.Weaver = require("./weaver");

classes.Weaver._deltaMergeableProperties = {
    strengtheningWeb: {
        type: {"is_game_object": true, "keyType": null, "name": "Web", "valueType": null},
        defaultValue: null,
    },

    weakeningWeb: {
        type: {"is_game_object": true, "keyType": null, "name": "Web", "valueType": null},
        defaultValue: null,
    },

};


classes.Weaver.strengthen.cerveau = {
    invalidate: classes.Weaver.invalidateStrengthen,
    args: [
        {
            name: "web",
            type: {"is_game_object": true, "keyType": null, "name": "Web", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
    invalidValue: false,
};

classes.Weaver.weaken.cerveau = {
    invalidate: classes.Weaver.invalidateWeaken,
    args: [
        {
            name: "web",
            type: {"is_game_object": true, "keyType": null, "name": "Web", "valueType": null},
        },
    ],
    returns: {
        type: {"is_game_object": false, "keyType": null, "name": "boolean", "valueType": null},
        defaultValue: false,
    },
    invalidValue: false,
};

//<<-- Creer-Merge: secret-Weaver -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Weaver -->>


classes.Web = require("./web");

classes.Web._deltaMergeableProperties = {
    length: {
        type: {"is_game_object": false, "keyType": null, "name": "float", "valueType": null},
        defaultValue: 0,
    },

    load: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

    nestA: {
        type: {"is_game_object": true, "keyType": null, "name": "Nest", "valueType": null},
        defaultValue: null,
    },

    nestB: {
        type: {"is_game_object": true, "keyType": null, "name": "Nest", "valueType": null},
        defaultValue: null,
    },

    spiderlings: {
        type: {"is_game_object": false, "keyType": null, "name": "list", "valueType": {"is_game_object": true, "keyType": null, "name": "Spiderling", "valueType": null}},
        defaultValue: [],
    },

    strength: {
        type: {"is_game_object": false, "keyType": null, "name": "int", "valueType": null},
        defaultValue: 0,
    },

};


//<<-- Creer-Merge: secret-Web -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// if you want to add a "secret" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

//<<-- /Creer-Merge: secret-Web -->>


// Hook up the game's internal classes that we just finished initializing
classes.Game.classes = classes;
classes.Game.prototype.classes = classes;

module.exports = classes.Game;
