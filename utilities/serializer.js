// Deals with transforming game states to and from serializable objects when communicating between client <--> sever
var constants = require("../constants");
var extend = require("extend");

var serializer = {
	isEmpty: function(obj){
		return (Object.getOwnPropertyNames(obj).length === 0);
	},

	isEmptyExceptFor: function(obj, key) {
		return (serializer.isObject(obj) && Object.getOwnPropertyNames(obj).length === 1 && obj[key] !== undefined);
	},

	isGameObjectReference: function(obj) {
		return serializer.isEmptyExceptFor(obj, 'id');
	},

	isObject: function(obj) {
		return (typeof(obj) === 'object' && obj !== null);
	},

	isSerializable: function(obj, key) {
		return serializer.isObject(obj) && obj.hasOwnProperty(key) && !String(key).startsWith("_") && (obj._serializableKeys === undefined || obj._serializableKeys[key]);
	},

	// serializes a game state to a structure that can be sent via json
	serialize: function(state, gameObjects) {
		gameObjects = gameObjects || state.gameObjects;
		var serialized = {};

		if(state.isArray) { // record the length, we never send arrays in serialized states because you can't tell when they change in size without sending all the elements
			serialized[constants.shared.DELTA_ARRAY_LENGTH] = state.length;
		}

		for(var key in state) {
			if(serializer.isSerializable(state, key)) {
				var value = state[key];
				if(serializer.isObject(value)) {
					if(state !== gameObjects && value.id !== undefined) { // then this is a game object not part of the gameObjects array, so don't serialize it as normal. just make a reference to it
						serialized[key] = {
							id: value.id,
						};
					}
					else {
						serialized[key] = serializer.serialize(value, gameObjects);
					}
				}
				else {
					serialized[key] = value;
				}
			}
		}
		return serialized;
	},

	// first and second should be serialized states from serializer.serialze
	getDelta: function(first, second) {
		var result = {};

		for (var key in first) {
			if(first.hasOwnProperty(key)){
				if(this.isObject(first[key]) && this.isObject(second[key])) {
					result[key] = serializer.getDelta(first[key], second[key]);
					if (result[key] === undefined) { // then the object was empty, there was no change (this with removed values will have the constant strings set)
						delete result[key];
					}
					else if(result[key][constants.shared.DELTA_ARRAY_LENGTH] !== undefined) {
						var len = constants.shared.DELTA_ARRAY_LENGTH;
						if(serializer.isEmptyExceptFor(result[key], len) && first[key][len] === second[key][len]) { // then this is an array that did not change in size or any elements, so delete it.
							delete result[key];
						}
					}
				}
				else if(first[key] !== second[key]) {
					result[key] = (second[key] === undefined ? constants.shared.DELTA_REMOVED : second[key]);
				}
			}
		}

		for(var key in second) {
			if(second.hasOwnProperty(key)) {
				if(first[key] === undefined) {
					result[key] = second[key];
				}
			}
		}

		return serializer.isEmpty(result) ? undefined : result;
	},

	unserialize: function(data, game) {
		if(serializer.isObject(data) && game) {
			var result = data.isArray ? [] : {};

			for(var key in data) {
				var value = data[key];
				if(typeof(value) == "object") {
					if(serializer.isGameObjectReference(value)) { // it's a tracked game object
						result[key] = game.getGameObject(value.id);
					}
					else {
						result[key] = serializer.unserialize(value, game);
					}
				}
				else {
					result[key] = value;
				}
			}

			return result;
		}
	},
}

module.exports = serializer;