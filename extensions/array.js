// Array Extensions: adding functions to the Array prototype

var ArrayExtensions = {
    /**
     * removes a matching element from the array, if present
     *
     * @param {*} element - the element you want to try to remove from the array
     * @returns {boolean} true if the element was present and removed, false otherwise
     */
    removeElement: function(element) {
        var index = this.indexOf(element);

        if(index > -1) {
            this.splice(index, 1);
            return true;
        }

        return false;
    },

    /*
     * returns the last element from the array, e.g. array[array.length - 1], but this is prettier
     *
     * @returns {*} the last element in the array
     */
    last: function() {
        return this[this.length - 1];
    },

    /**
     * returns if this is an array. Mostly useful as you can do checked: if(objThatMightBeArray.isArray) { whatever }
     *
     * @returns {boolean} if this is an array
     */
    isArray: function() {
        return Array.isArray(this);
    },

    /**
     * checks if an element is present in the array
     *
     * @param {*} element - the element you want to check if is in the array
     * @returns {boolean} true if present, false otherwise
     */
    contains: function(element) {
        return (this.indexOf(element) > -1);
    },

    /**
     * returns a shallow clone of this array
     *
     * @returns {Array} shallow copy of this. Literally just this.slice();
     */
    clone: function() {
        return this.slice();
    },

    /**
     * returns a random element from the array
     *
     * @returns {*} a random element from the array. this array does not change
     */
    randomElement: function() {
        return this[Math.floor(Math.random() * this.length)];
    },

    /**
     * shuffles this array randomly
     *
     * @returns {Array} this array
     */
    shuffle: function() { // from http://stackoverflow.com/a/6274381/944727
        for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
        return this;
    },

    /**
     * pushes elements into the array only if they are not already present
     *
     * @param {...*} elements to try to push.
     * @returns {number} new length of this array
     */
    pushIfAbsent: function(/* ... */) {
        var pushing = [];
        for(var i = 0; i < arguments.length; i++) {
            if(!this.contains(arguments[i])) {
                pushing.push(arguments[i]);
            }
        }

        return this.push.apply(this, pushing);
    },

    /**
     * gets an element in the array wrapping around (both ways), so -1 would be the last element, and length would warp to 0.
     *
     * @oaram {number} index - index to get in this array, if it is out of bounds (index < 0 or index >= this.length), we will "wrap" that index around to be in range
     * @returns {*} element at the index, wrapped around when out of range
     */
    getWrapAroundAt: function(index) {
        return this[Math.wrapAround(index, this.length)];
    },

    /**
     * returns the next element in the array by some offset,, wrapping around if it would walk off the array
     *
     * @param {*} element - element in the array to find the index of
     * @param {number} offset - from the element's position where to move, up or down and will wrap around
     * @returns {*|undefined} undefined if the element was not in this array, or the element at the offset from the passed in element in the array, wrapping around
     */
    getWrapAround: function(element, offset) {
        var index = this.indexOf(element);
        if(index < 0) {
            return;
        }

        return this.getWrapAroundAt(index + (offset || 0));
    },

    /**
     * convenience function to get the next element in this array after some element, wrapping around if it would walk off the array
     *
     * @see Array.getWrapAround
     */
    nextWrapAround: function(element) {
        return this.getWrapAround(element, 1);
    },

    /**
     * convenience function to get the previous element in this array after some element, wrapping around if it would walk off the array
     *
     * @see Array.getWrapAround
     */
    previousWrapAround: function(element) {
        return this.getWrapAround(element, -1);
    },

    /**
     * sorts the array in ascending order (1, 2, 3, 4, ...) based on an optional key
     *
     * @param {string} key - if sorting an array of objects then sort based on this key
     * @returns {Array} this array, now sorted in place
     */
    sortAscending: function(key) {
        return this.sort(function (a, b) {
            if(key !== undefined ? (a[key] > b[key]) : a > b) {
                return 1;
            }

            if(key !== undefined ? (a[key] < b[key]) : a < b) {
                return -1;
            }

            return 0; // a must be equal to b
        });
    },

    /**
     * sorts the array in Descending order (10, 9, 8, 7, ...) based on an optional key
     *
     * @param {string} key - if sorting an array of objects then sort based on this key
     * @returns {Array} this array, now sorted in place
     */
    sortDescending: function(key) {
        return this.sort(function (a, b) {
            if(key !== undefined ? (a[key] < b[key]) : a < b) {
                return 1;
            }

            if(key !== undefined ? (a[key] > b[key]) : a > b) {
                return -1;
            }

            return 0; // a must be equal to b
        });
    },
};

for(var extension in ArrayExtensions) {
    if(typeof(Array.prototype[extension]) !== "function") {
        Array.prototype[extension] = ArrayExtensions[extension];
    }
}
