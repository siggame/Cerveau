var log = require("../log");
var Class = require(__basedir + "/utilities/class");
var BaseGameObject = require("./baseGameObject");
var ObscuredDeltaMergeable = require("./obscuredDeltaMergeable");

/**
 * @class ObscuredGameObject - a game object that is capable of having it's properties obscured
 */
var ObscuredGameObject = Class(BaseGameObject, ObscuredDeltaMergeable, {
    init: function(data) {
        BaseGameObject.init.apply(this, arguments);

        //ObscuredDeltaMergeable.init.apply(this, arguments); // No need to call, BaseGameObject will setup the delta mergeable stuff, ObscuredDeltaMergeable doesn't init anything new
    },
});

module.exports = FogOfWarGameObject;
