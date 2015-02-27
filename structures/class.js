module.exports = function(parentClass1 /* ... to {class values} */) {
	var prototype = arguments[arguments.length - 1];
	var parentClasses = [];
	for(var i = 0; i < arguments.length - 1; i++) {
		parentClasses.push(arguments[i]);
	}

	var newClass = function() {
		this.__proto__.init.apply(this, arguments); // arguments of the newClass function, not of this Class() function
	}

	for(var i = 0; i < parentClasses.length; i++) {
		var parentClass = parentClasses[i];
		for(var property in parentClass.prototype) {
			if(prototype[property] === undefined) {
				prototype[property] = parentClass.prototype[property];
			}
		}
	}

	prototype._parentClasses = parentClass;
	newClass.prototype = prototype;

	for(var property in prototype) { // also assign the properties of the prototype to this class so we can call super methods via SuperClass.SuperFunction.call(this, ...);
		newClass[property] = prototype[property];
	}

	return newClass;
}
