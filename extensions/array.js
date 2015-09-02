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
        return (Object.prototype.toString.call(this) === '[object Array]');
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
        var cloned = [];
        for(var i = 0; i < this.length; i++) {
            cloned[i] = this[i];
        }

        return cloned;
    },
};

for(var extension in ArrayExtensions) {
    if (typeof Array.prototype[extension] != 'function') {
        Array.prototype[extension] = ArrayExtensions[extension];
    }
}
