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
		return true;
	},
	contains: function(element) {
		return this.indexOf(element) > -1 ? true : false;
	},
};

for(var extension in ArrayExtensions) {
	if (typeof Array.prototype[extension] != 'function') {
		Array.prototype[extension] = ArrayExtensions[extension];
	}
}
