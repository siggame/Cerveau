// String Extensions: adding functions to the String prototype

var StringExtensions = {
    startsWith: function(str) {
        return this.slice(0, str.length) == str;
    },

    endsWith: function (str){
        return this.slice(-str.length) == str;
    },

    upcaseFirst: function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },

    lowercaseFirst: function() {
        return this.charAt(0).toLowerCase() + this.slice(1);
    },

    padLeft: function(padding, length) {
        var str = "" + this;
        while(str.length < length) {
            str = "" + padding + str;
        }

        return str;
    },

    padRight: function(padding, length) {
        var str = "" + this;
        while(str.length < length) {
            str = "" + str + padding;
        }

        return str;
    },
};

for(var extension in StringExtensions) {
    if (typeof String.prototype[extension] != 'function') {
        String.prototype[extension] = StringExtensions[extension];
    }
}
