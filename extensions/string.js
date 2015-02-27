// String Extensions: adding functions to the String prototype

var StringExtensions = {
	startsWith: function(str) {
		return this.slice(0, str.length) == str;
	},

	endsWith: function (str){
		return this.slice(-str.length) == str;
	},

	capitalize: function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	},

	uncapitalize: function() {
		return this.charAt(0).toLowerCase() + this.slice(1);
	},
};

for(var extension in StringExtensions) {
	if (typeof String.prototype[extension] != 'function') {
		String.prototype[extension] = StringExtensions[extension];
	}
}
