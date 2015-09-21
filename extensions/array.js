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
};

for(var extension in ArrayExtensions) {
    if (typeof(Array.prototype[extension]) !== "function") {
        Array.prototype[extension] = ArrayExtensions[extension];
    }
}
