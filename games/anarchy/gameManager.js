// Generated by Creer at 10:42PM on October 16, 2015 UTC, git hash: '98604e3773d1933864742cb78acbf6ea0b4ecd7b'
// Note: You should never modify this file.

var GameManager = require(__basedir + "/gameplay/shared/gameManager");
var serializer = require(__basedir + "/gameplay/serializer");

/**
 * An instance of the base GameManager class, given the structure of this Anarchy game so it can manage the game safely.
 */
var anarchyGameManager = new GameManager({
    Game: {
        name: "Anarchy",
    },

    AI: {
        runTurn: {
            args: [
            ],
            returns: {
                converter: serializer.defaultBoolean,
                defaultValue: true,
            },
        },
    },

    Building: {
    },

    FireDepartment: {
        extinguish: {
            args: [
                {
                    name: "building",
                    converter: serializer.defaultGameObject,
                },
            ],
            returns: {
                converter: serializer.defaultBoolean,
                defaultValue: false,
            },
        },
    },

    Forecast: {
    },

    GameObject: {
        log: {
            args: [
                {
                    name: "message",
                    converter: serializer.defaultString,
                },
            ],
            returns: undefined,
        },
    },

    Player: {
    },

    PoliceDepartment: {
        raid: {
            args: [
                {
                    name: "warehouse",
                    converter: serializer.defaultGameObject,
                },
            ],
            returns: {
                converter: serializer.defaultInteger,
                defaultValue: 0,
            },
        },
    },

    Warehouse: {
        ignite: {
            args: [
                {
                    name: "building",
                    converter: serializer.defaultGameObject,
                },
            ],
            returns: {
                converter: serializer.defaultInteger,
                defaultValue: 0,
            },
        },
    },

    WeatherStation: {
        intensify: {
            args: [
                {
                    name: "negative",
                    converter: serializer.defaultBoolean,
                },
            ],
            returns: {
                converter: serializer.defaultBoolean,
                defaultValue: false,
            },
        },
        rotate: {
            args: [
                {
                    name: "counterclockwise",
                    converter: serializer.defaultBoolean,
                },
            ],
            returns: {
                converter: serializer.defaultBoolean,
                defaultValue: false,
            },
        },
    },
});

module.exports = anarchyGameManager;
