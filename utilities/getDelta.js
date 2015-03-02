var constants = require("../constants");

var isEmpty = function(obj){
	return (Object.getOwnPropertyNames(obj).length === 0);
};

// @param first: the first object to find the differences as it transformed to the second object
// @param second: the new object to find the differences from the first (old) object
// @param result: object to store the diff in
var differ = function(first, second, result) {
	var i = 0;
	for (i in first) {
		if(first.hasOwnProperty(i)){
			if (typeof first[i] === "object" && typeof second[i] === "object") {
				result[i] = differ(first[i], second[i], {});
				if (!result[i]) { // then the object was empty, there was no change (this with removed values will have the constant strings set)
					delete result[i];
				}
				else {
					result[i][constants.shared.DELTA_ARRAY_LENGTH] = second[i].length;
				}
			}
			else if (first[i] != second[i]) {
				result[i] = (second[i] === undefined ? constants.shared.DELTA_REMOVED : second[i]);
			}
		}
	}

	for(i in second) {
		if(second.hasOwnProperty(i)) {
			if(first[i] === undefined) {
				result[i] = second[i];
			}
		}
	}

	return isEmpty(result) ? undefined : result;
};

var getDelta = function(oldObject, newObject) {
	return differ(oldObject, newObject, {});
};

module.exports = getDelta;
