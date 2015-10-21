// Math Extensions: adding functions to the Math utilities

var mathExtensions = {
    /**
     * wraps an index around a given range
     *
     * @param {number} index - the number to wrap within 0 to length, so if this was -1 the result would be length-1
     * @param {number} length - the right bound to wrap around back to 0 from
     * @returns {number} the index "wrapped around" 0 to length. 0 <= result < length
     */
    wrapAround: function(index, length) {
        return (index % length + length) % length;
    },

    /**
     * converts arguments to {x, y} points
     */
    _getPoints: function(/* ... */) {
        var points = [];
        for(var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            var x = 0;
            var y = 0;

            if(typeof(arg) === "object") { // assume {x: 0, y: 0} or [0, 0] to represent the point
                x = typeof(arg.x) === "undefined" ? arg[0] : arg.x;
                y = typeof(arg.y) === "undefined" ? arg[1] : arg.y;
            }
            else { // assume number
                x = arg;
                y = arguments[++i];
            }

            points.push({x: x, y: y});
        }

        return points;
    },

    /**
     * Gets the Manhattan distance between two points (x1, y1) and (x2, y2); the distance between two points measured along axes at right angles.
     *
     * @param {...} points - points either in the format [x1, y1, x2, y2], [{x1, y1}, {x1, y2}], or [ [x1, y1], [x1, y2] ]
     * @returns {number} the manhattan distance between the two points.
     */
    manhattanDistance: function(points) {
        var pts = Math._getPoints.apply(Math, arguments);
        return Math.abs(pts[0].x - pts[1].x) + Math.abs(pts[0].y - pts[1].y);
    },

    /**
     * Gets the Euclidean distance between two points (x1, y1) and (x2, y2); Pythagorean theorem: The distance between two points is the length of the path connecting them.
     *
     * @param {...} points - points either in the format [x1, y1, x2, y2], [{x1, y1}, {x1, y2}], or [ [x1, y1], [x1, y2] ]
     * @returns {number} the euclidean distance between the two points
     */
    euclideanDistance: function(points) {
        var pts = Math._getPoints.apply(Math, arguments);
        return Math.sqrt(Math.pow(pts[1].x - pts[0].x, 2) + Math.pow(pts[1].y - pts[0].y, 2));
    },

    /**
     * computes the sum of all passed in numbers
     *
     * @param {...number|Array.<number>} numbers - numbers to sum
     * @returns {number} the sum of all passed in numbers
     */
    sum: function(numbers) {
        var nums = Array.isArray(numbers) ? numbers : arguments;
        var sum = 0;
        for(var i = 0; i < nums.length; i++) {
            sum += Number(nums[i]);
        }
        return sum;
    },

    /**
     * computes the average of all passed in numbers
     *
     * @param {...number|Array.<number>} numbers - numbers to average
     * @returns {number} the average of all passed in numbers
     */
     average: function(numbers) {
        var length = (Array.isArray(numbers) ? numbers : arguments).length;
        return Math.sum.apply(Math, arguments)/length;
     },

    /**
     * returns a random integer within the range of upper to lower (inclusive). lower defaults to 0.
     *
     * @param {number} upper - the upper range, this number is valid as a random return value
     * @param {number} [lower] - the lower range, defaults to 0
     * @returns {number} a random integer within the range lower to upper
     */
    randomInt: function(upper, lower) {
        lower = lower || 0;
        var max = Math.max(upper, lower);
        var min = Math.min(upper, lower);
        return Math.floor(Math.random()*(max - min + 1) + min);
    },
};

for(var extension in mathExtensions) {
    if (typeof(Math[extension]) !== "function") {
        Math[extension] = mathExtensions[extension];
    }
}
