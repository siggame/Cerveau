# Node.js Style Guide

This is a guide for writing consistent and aesthetically pleasing JavaScript
code in the Cerveau project, and its games.
It is inspired by what is popular within the community, and flavored with some
personal opinions. Additional considerations were used to help ease C++
developers into JavaScript, as that is what MST teaches freshmen.

This guide was originally created by [Felix Geisendörfer](http://felixge.de/)
and is licensed under the
[CC BY-SA 3.0](http://creativecommons.org/licenses/by-sa/3.0/) license.
Modifications were made to adapt it to
[Cadre](https://github.com/siggame/Cadre)'s
[Cerveau](https://github.com/siggame/Cerveau) project by Jacob Fischer.

![Creative Commons License](http://i.creativecommons.org/l/by-sa/3.0/88x31.png)

## Table of contents

### Formatting
* [4 Spaces for indention](#4-spaces-for-indention)
* [Newlines](#newlines)
* [No trailing whitespace](#no-trailing-whitespace)
* [Use Semicolons](#use-semicolons)
* [Use double quotes](#use-double-quotes)
* [Opening braces go on the same line](#opening-braces-go-on-the-same-line)
* [Declare one variable per var statement](#declare-one-variable-per-var-statement)

### Naming Conventions
* [Use lowerCamelCase for variables, properties and function names](#use-lowercamelcase-for-variables-properties-and-function-names)
* [Use UpperCamelCase for class names](#use-uppercamelcase-for-class-names)
* [Use UPPERCASE for Constants](#use-uppercase-for-constants)

### Variables
* [Object / Array creation](#object--array-creation)

### Conditionals
* [Use the === operator](#use-the--operator)
* [Use descriptive conditions](#use-descriptive-conditions)

### Functions
* [Write small functions](#write-small-functions)
* [Return early from functions](#return-early-from-functions)
* [Name your closures](#name-your-closures)
* [No nested closures](#no-nested-closures)
* [Method chaining](#method-chaining)

### Comments
* [Use slashes for comments](#use-slashes-for-comments)
* [JSDoc your functions](#jsdoc-your-functions)

### Miscellaneous
* [Object.freeze, Object.preventExtensions, Object.seal, with, eval](#objectfreeze-objectpreventextensions-objectseal-with-eval)
* [Requires At Top](#requires-at-top)
* [Do not extend the Object prototype](#do-not-extend-the-object-prototype)

### Cervea Specific
* [Use log not console.log](#use-log-not-consolelog)
* [Work inside Creer merge tags](#work-inside-creer-merge-tags)

## Formatting


### 4 Spaces for indention

Use 4 spaces for indenting your code and swear an oath to never mix tabs and
spaces - a special kind of hell is awaiting you otherwise.

### Newlines

Use UNIX-style newlines (`\n`), and a newline character as the last character
of a file. Windows-style newlines (`\r\n`) are forbidden inside any repository.

### No trailing whitespace

Just like you brush your teeth after every meal, you clean up any trailing
whitespace in your JS files before committing. Otherwise the rotten smell of
careless neglect will eventually drive away contributors and/or co-workers.

### Use Semicolons

According to [scientific research][hnsemicolons], the usage of semicolons is
a core value of our community. Consider the points of [the opposition][], but
be a traditionalist when it comes to abusing error correction mechanisms for
cheap syntactic pleasures.

[the opposition]: http://blog.izs.me/post/2353458699/an-open-letter-to-javascript-leaders-regarding
[hnsemicolons]: http://news.ycombinator.com/item?id=1547647

### Use double quotes

Use double quotes when creating strings. This is to stay similar to C++.

*Right:*

```js
var foo = "bar";
```

*Wrong:*

```js
var foo = 'bar';
```

### Opening braces go on the same line

Your opening braces go on the same line as the statement.

*Right:*

```js
if(true) {
    console.log("winning");
}
```

*Wrong:*

```js
if(true)
{
    console.log("losing");
}
```

Also, notice the use of whitespace after the condition statement, but not before
the control statement.

### Declare one variable per var statement

Declare one variable per var statement, it makes it easier to re-order the
lines. However, ignore [Crockford][crockfordconvention] when it comes to
declaring variables deeper inside a function, just put the declarations wherever
they make sense.

*Right:*

```js
var keys = ["foo", "bar"];
var values = [23, 42];

var object = {};
while(keys.length) {
    var key = keys.pop();
    object[key] = values.pop();
}
```

*Wrong:*

```js
var keys = ["foo", "bar"],
    values = [23, 42],
    object = {},
    key;

while(keys.length) {
    key = keys.pop();
    object[key] = values.pop();
}
```

[crockfordconvention]: http://javascript.crockford.com/code.html

### Naming Conventions

### Use lowerCamelCase for variables, properties and function names

Variables, properties and function names should use `lowerCamelCase`.  They
should also be descriptive. Single character variables and uncommon
abbreviations should generally be avoided.

*Right:*

```js
var adminUser = db.query("SELECT * FROM users ...");
```

*Wrong:*

```js
var admin_user = db.query("SELECT * FROM users ...");
```

### Use UpperCamelCase for class names

Class names should be capitalized using `UpperCamelCase`.

*Right:*

```js
var BankAccount = Class();
```

*Wrong:*

```js
var bank_Account = Class();
```

## Use UPPERCASE for Constants

Constants should be declared as regular variables or static class properties,
using all uppercase letters.

*Right:*

```js
var SECOND = 1 * 1000;

function File() {
}
File.FULL_PERMISSIONS = 0777;
```

*Wrong:*

```js
const SECOND = 1 * 1000;

function File() {
}
File.fullPermissions = 0777;
```

[const]: https://developer.mozilla.org/en/JavaScript/Reference/Statements/const

## Variables

### Object / Array creation

Use trailing commas and put *short* declarations on a single line. Only quote
keys when your interpreter complains:

*Right:*

```js
var a = ["hello", "world"];
var b = {
    good: "code",
    "is generally": "pretty",
};
```

*Wrong:*

```js
var a = [
    "hello", "world"
];
var b = {"good": "code"
        , is generally: "pretty"
        };
```

## Conditionals

### Use the === operator

Programming is not about remembering [stupid rules][comparisonoperators]. Use
the triple equality operator as it will work just as expected.

*Right:*

```js
var a = 0;
if(a !== "") {
    console.log("winning");
}

```

*Wrong:*

```js
var a = 0;
if(a == "") {
    console.log("losing");
}
```

[comparisonoperators]: https://developer.mozilla.org/en/JavaScript/Reference/Operators/Comparison_Operators

### Use descriptive conditions

Any non-trivial conditions should be assigned to a descriptively named variable
or function:

*Right:*

```js
var isValidPassword = password.length >= 4 && /^(?=.*\d).{4,}$/.test(password);

if(isValidPassword) {
    console.log("winning");
}
```

*Wrong:*

```js
if(password.length >= 4 && /^(?=.*\d).{4,}$/.test(password)) {
    console.log("losing");
}
```

## Functions

### Write small functions

Keep your functions short. A good function fits on a slide that the people in
the last row of a big room can comfortably read. So don"t count on them having
perfect vision and try to limit yourself to ~15 lines of code per function.

### Return early from functions

To avoid deep nesting of if-statements, always return a function's value as
early as possible.

*Right:*

```js
function isPercentage(val) {
    if(val < 0) {
        return false;
    }

    if(val > 100) {
        return false;
     }

     return true;
}
```

*Wrong:*

```js
function isPercentage(val) {
    if(val >= 0) {
        if(val < 100) {
            return true;
        } else {
            return false;
        }
    }
    else {
        return false;
    }
}
```

Or for this particular example it may also be fine to shorten things even
further:

```js
function isPercentage(val) {
    var isInRange = (val >= 0 && val <= 100);
    return isInRange;
}
```

### Name your closures

Feel free to give your closures a name. It shows that you care about them, and
will produce better stack traces, heap and cpu profiles.

*Right:*

```js
req.on("end", function onEnd() {
    console.log("winning");
});
```

*Wrong:*

```js
req.on("end", function() {
    console.log("losing");
});
```

### No nested closures

Use closures, but try not to nest them. Otherwise your code could become a mess.

*Right:*

```js
setTimeout(function() {
    client.connect(afterConnect);
}, 1000);

function afterConnect() {
    console.log("winning");
}
```

*Wrong:*

```js
setTimeout(function() {
    client.connect(function() {
        console.log("losing");
    });
}, 1000);
```


### Method chaining

One method per line should be used if you want to chain methods.

You should also indent these methods so it's easier to tell they are part of
the same chain.

*Right:*

```js
User
    .findOne({ name: "foo" })
    .populate("bar")
    .exec(function(err, user) {
        return true;
     });
````

*Wrong:*

```js
User
.findOne({ name: "foo" })
.populate("bar")
.exec(function(err, user) {
    return true;
});

User.findOne({ name: "foo" })
    .populate("bar")
    .exec(function(err, user) {
        return true;
    });

User.findOne({ name: "foo" }).populate("bar")
    .exec(function(err, user) {
    return true;
});

User.findOne({ name: "foo" }).populate("bar")
    .exec(function(err, user) {
        return true;
    });
````

## Comments

### Use slashes for comments

Use slashes for both single line and multi line comments. Try to write
comments that explain higher level mechanisms or clarify difficult
segments of your code. Don"t use comments to restate trivial things.

*Right:*

```js
// "ID_SOMETHING=VALUE" -> ["ID_SOMETHING=VALUE", "SOMETHING", "VALUE"]
var matches = item.match(/ID_([^\n]+)=([^\n]+)/));

// This has a nasty side effect where a failure to increment a redis counter
// used for statistics will cause an exception. This needs  to be fixed in
// a later iteration.
var user = loadUser(id, cb);

var isSessionValid = (session.expires < Date.now());
if(isSessionValid) {
    // ...
}
```

*Wrong:*

```js
// Execute a regex
var matches = item.match(/ID_([^\n]+)=([^\n]+)/);

// Usage: loadUser(5, function() { ... })
var user = loadUser(id, cb);

// Check if the session is valid
var isSessionValid = (session.expires < Date.now());
// If the session is valid
if(isSessionValid) {
    // ...
}
```

### JSDoc your functions

Use [JSDoc](http://usejsdoc.org/) documentation style for all your functions.
Other people will need to use them at some point, and they will be ever
grateful if they know more about it.

*Right*:
```js
/**
 * checks if a number is even
 *
 * @param {number} num - the number to check if is even
 * @returns {boolean} true if even, false otherwise (odd)
 */
function isEven(num) {
    return (num%2 === 0);
};
```

*Wrong*:

```js
// returns if even
function isEven(num) {
    return (num%2 === 0);
};
```

## Miscellaneous

### Object.freeze, Object.preventExtensions, Object.seal, with, eval

Crazy shit that you will probably never need. Stay away from it unless you are
a JavaScript ninja. And even then you're probably a monkey tampering with a
nuke.

### Requires At Top

Always put requires at top of file to clearly illustrate a file's dependencies.
Besides giving an overview for others at a quick glance of dependencies and
possible memory impact, it allows one to determine if they need a package.json
file should they choose to use the file elsewhere.

### Do not extend the Object prototype

Do not extend the Object prototype of native JavaScript Object. This is because
if will screw up `for(var key in obj)` loops.

You should, however, wrap your `for in` loops in `hasOwnProperty` checks. Just
because you don't extend the Object prototype doesn't mean some other author
didn't know of this problem and extended it anyways.

*Right:*

```js
var obj = {
    a: 2,
    b: c,
};

for(var key in obj) {
    if(obj.hasOwnProperty(key)) {
        console.log("winning");
    }
    else {
        console.log("someone didn't listen and extended the Object prototype");
    }
}
```

*Wrong:*

```js
var obj = {
    a: 2,
    b: c,
};

for(var key in obj) {
    console.log("losing");
}
```

## Cervea Specific

### Use log not console.log

JavaScript and Node.JS expose `console.log`. We have a more robust `log`
function availible and required in most Cerveau files that can capture logs
to other streams like a text file, so use it.

*Right*:

```js
log("winning");
```

*Wrong*:
```js
console.log("losing");
```

### Work inside Creer merge tags

When developing a Cerveau game, the [Creer](https://github.com/siggame/Creer)
code generator has special tags it uses to auto-merge code. You shouldn't need
to write code outside them, so don't (unless you know what you are doing).

*Right*:

```js
var autoGenerated = true;

//<<-- Creer-Merge: some-tag -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

var foo = "bar";

//<<-- /Creer-Merge: some-tag -->>
```

*Wrong*:

```js
var autoGenerated = true;
var foo = "bar";

//<<-- Creer-Merge: some-tag -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
//<<-- /Creer-Merge: some-tag -->>
```
