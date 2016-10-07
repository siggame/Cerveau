var constants = require("./constants");
var Class = require(__basedir + "/utilities/class");
var BaseGameObject = require("./shared/baseGameObject");

/**
 * A collection of static functions that deals with transforming game states to and from serializable objects when communicating between client <--> sever
 */
var serializer = {
    defaultBoolean: function(b) {
        switch(typeof(b)) {
            case "string":
                var lowered = b.toLowerCase();
                if(lowered === "true") { // they sent some form of "true" as a string, so make it the boolean true
                    return true;
                }
                else if(lowered === "false") { // they sent some form of "false" as a string, so make it the boolean false
                    return false;
                }
                return Boolean(b);
            case "number":
                return b !== 0;
            default:
                return !!b;
        }
    },

    defaultNumber: function(n) {
        return Number(n) || 0.0;
    },

    defaultInteger: function(i) {
        return parseInt(i) || 0;
    },

    defaultString: function(s) {
        return (s === undefined ? "" : String(s));
    },

    defaultArray: function(a) {
        return (Array.isArray(a) ? a : []);
    },

    defaultObject: function(o) {
        return (serializer.isObject(o) ? o : {});
    },

    defaultGameObject: function(o) {
        return (Class.isInstance(o, BaseGameObject) ? o : null);
    },

    defaultType: function(typeName, o) {
        return serializer[typeName.toLowerCase().upperFirst()](o);
    },

    isEmpty: function(obj) {
        return (Object.getOwnPropertyNames(obj).length === 0);
    },

    isEmptyExceptFor: function(obj, key) {
        return (serializer.isObject(obj) && Object.getOwnPropertyNames(obj).length === 1 && obj[key] !== undefined);
    },

    isGameObjectReference: function(obj) {
        return serializer.isEmptyExceptFor(obj, "id");
    },

    isObject: function(obj) {
        return (typeof(obj) === "object" && obj !== null);
    },

    isSerializable: function(obj, key) {
        return serializer.isObject(obj) && (obj.hasOwnProperty(key) || (obj._serializableKeys && obj._serializableKeys[key])) && !String(key).startsWith("_") && (obj._serializableKeys === undefined || obj._serializableKeys[key]);
    },

    isDeltaArray: function(a) {
        return (serializer.isObject(a) && a[constants.shared.DELTA_LIST_LENGTH] !== undefined);
    },

    /**
     * serializes something about a game so it is safe to send over a socket. This is required to avoid cycles and send lists correctly.
     *
     * @param {*} state - The variable you want to serialize. Anything in the game should be serializeable, numberss, strings, BaseGameObjects, dicts, lists, nulls, etc.
     * @param {BaseGame} game - the game you are serializing things for
     * @returns {*} state, serialized. It will never be the same Object if it is an Object ({} or [])
     */
    serialize: function(state, game) {
        if(!serializer.isObject(state)) {
            return state;
        }
        else if(Class.isInstance(state, BaseGameObject)) { // no need to serialize this whole thing
            return { id: state.id };
        }

        game = game || state;
        var serialized = {};

        if(state.isArray) { // record the length, we never send arrays in serialized states because you can't tell when they change in size without sending all the elements
            serialized[constants.shared.DELTA_LIST_LENGTH] = state.length;
        }

        for(var key in state) {
            if(serializer.isSerializable(state, key)) {
                var value = state[key];
                if(serializer.isObject(value)) {
                    serialized[key] = serializer.serialize(value, game);
                }
                else {
                    serialized[key] = value;
                }
            }
        }
        return serialized;
    },

    /**
     * Deserialized data from a game client
     *
     * @param {*} data - data to deserialize
     * @param {BaseGame} game - game to lookup game objects in for game object references in data
     * @param {Function} [dataTypeConverter] - function to convert the deserialized value once found
     * @returns {*} data now deserialized, will create new objects instead of reusing data
     */
    deserialize: function(data, game, dataTypeConverter) {
        if(serializer.isObject(data) && game) {
            var result = data.isArray ? [] : {};

            for(var key in data) {
                if(data.hasOwnProperty(key)) {
                    var value = data[key];
                    if(typeof(value) === "object") {
                        if(serializer.isGameObjectReference(value)) { // it's a tracked game object
                            result[key] = game.getGameObject(value.id);
                        }
                        else {
                            result[key] = serializer.deserialize(value, game);
                        }
                    }
                    else {
                        result[key] = value;
                    }
                }
            }

            return result;
        }

        if(dataTypeConverter) {
            data = dataTypeConverter(data);
        }

        return data;
    },
};

module.exports = serializer;
