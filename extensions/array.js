// Array Extensions: adding functions to the Array prototype

var ArrayExtensions = {
    removeElement: function(element) {
        var index = this.indexOf(element);

        if(index > -1) {
            this.splice(index, 1);
            return true;
        }

        return false;
    },

    last: function() {
        return this[this.length - 1];
    },

    isArray: function() {
        return Array.isArray(this);
    },

    contains: function(element) {
        return (this.indexOf(element) > -1);
    },

    empty: function() {
        while(this.length > 0) {
            this.pop();
        }
    },

    clone: function() {
        return this.slice();
    },

    randomElement: function() {
        return this[Math.floor(Math.random() * this.length)];
    },

    shuffle: function() { // from http://stackoverflow.com/a/6274381/944727
        for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
        return this;
    },

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
    if (typeof Array.prototype[extension] != 'function') {
        Array.prototype[extension] = ArrayExtensions[extension];
    }
}
