/**
 * @function Class: a simple class building interface. Pass to it parent classes (built with Class()) then a dictionary of functions. This will assign all to the new classe's prototype object, and return that new class so you can instantiate it like normal javascarip "classes" with var a = new A()
 */
var Class = function(/*parentClass1, parentClass2, ..., parentClassN, newClassPrototype*/) {
    var prototype = arguments[arguments.length - 1]

    if(prototype === undefined || Class.isClass(prototype)) {
        prototype = {};
    }

    var parentClasses = [];
    for(var i = 0; i < arguments.length; i++) {
        var parentClass = arguments[i];
        if(Class.isClass(parentClass)) {
            parentClasses.push(parentClass);
        }
    }

    var newClass = function() {
        this.__proto__.init.apply(this, arguments); // arguments of the newClass function, not of this Class() function
    };

    // copy all the functions from the parent class(es) to the new class's prototype, if two parents share the same function the first parent listed will be the one that the new child class's method defaults to
    for(var i = 0; i < parentClasses.length; i++) {
        var parentClass = parentClasses[i];
        for(var property in parentClass.prototype) {
            if(!prototype.hasOwnProperty(property)) {
                prototype[property] = parentClass.prototype[property];
            }
        }
    }

    prototype.init = prototype.init || function() {};
    prototype._isClass = true;
    prototype._mainClass = newClass;
    prototype._parentClasses = parentClasses;
    newClass.prototype = prototype;

    for(var property in prototype) { // also assign the properties of the prototype to this class so we can call super methods via SuperClass.SuperFunction.call(this, ...);
        newClass[property] = prototype[property];
    }

    // this create an instance of newClass, but does NOT call the init() fuction. it is expected you plan to call this later
    // simple put, creates an object with the prototype set to this newClass
    newClass.uninitialized = function() {
        return Object.create(prototype);
    };

    return newClass;
}

/**
 * Tests if the passed in variable is a class built with the above Class method
 *
 * @param can be any type, but to return true it will need to be a class created with the above Class method
 * @returns {boolean} represents if the passed in variable is a class constructor made with the Class method
 */
Class.isClass = function(klass) {
    return (typeof(klass) === 'function' && klass._isClass);
};

/**
 * checks if a passed in variable is an instance of a Class (or that class's parent Classes)
 *
 * @param {Object} obj - object to check if it is an instance of isClass
 * @param {function} [isClass] - constructor made with Class method to check if the passed in object is an instance of, or an instance of one of it's parent classes. If not passed in then just checks if obj is a class made instance
 */
Class.isInstance = function(obj, isClass) {
    if(obj === null || typeof(obj) !== "object" || !obj._isClass) {
        return false;
    }

    if(isClass === undefined && obj._isClass) {
        return true;
    }

    var classes = [ obj._mainClass ];
    while(classes.length > 0) {
        var theClass = classes.pop();

        if(theClass === isClass) {
            return true;
        }

        for(var i = 0; i < theClass._parentClasses.length; i++) {
            classes.push(theClass._parentClasses[i]);
        }
    }
};

module.exports = Class;

/** @example

var Animal = Class({
    init: function() {
        this.isAlive = true;
        this.says = "AK!";
    },

    talk: function() {
        console.log(this.says);
    },
});

var LovedOne = Class({
    init: function(isLoved) {
        this.isLoved = isLoved;
    },

    leave: function() {
        this.isLoved = false;
    },
});

var Dog = Class(Animal, LovedOne { // multiple inheritance!
    init: function(breed) {
        Animal.init.call(this);            // calls the Animal class's super method init, passing to this instance to be 'this' in that function
        LovedOne.init.call(this, true);    // calls the LovedOne class's super method init, passing this to be 'this', and 'true' to be the argument for 'isLoved'

        this.says = "bark!";
        this.breed = breed;
    },

    wagTail: function() {
        console.log("the dog of breed " + this.breed + " wags it's tail!");
    },
});

// usage:

var gecko = new Animal();
var exGirlfriend = new LovedOne(false);
var pug = new Dog("pug");

gecko.talk();    // prints "AK!"
pug.talk();        // prints "bark!"

pug.wagTail();    // prints "the dog of breed pug wags it's tail!"

gecko.wagTail(); // breaks, Animal class does not have wagTail()

if(pug.isLoved) {
    console.log("I love my pug!"); // works because all dogs are loved, because the Dog class passes in true to it's LovedOne.init function
}

if(exGirlfriend.isLoved) { // exGirlfriend is not loved because we passed in 'false' to its constructor
    exGirlfriend.leave();
}

*/
