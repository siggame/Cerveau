var http = require('http');
var crypto = require("crypto");
var querystring = require("querystring");
var extend = require('extend');
var Class = require("./utilities/class");

/*
 * @class Authenticator - Authenticates play requests with a server. Ideally for organizations outside SIG-GAME you'd inherit this and override how it works with your own web authentication

 currently a new version of https://github.com/siggame/MegaMinerAI-15/blob/master/server/networking/WebServerAuthenticator.py
 */
var Authenticator = Class({
    init: function(authenticate) {
        this.check = (authenticate === true);

        if(this.check) {
            var config = require("./authenticationServer.data");

            this._baseRequest = {
                host: config.server || "127.0.0.1",
                path: config.path,
                port: config.port || 80,
                method: config.method || "GET",
            };
        }
    },

    /*
     * Authenticates play requests for the lobby.
     *
     * @param {Object} args - key word args. Not technically needed when authentication is disabled
     * @param   {string} args.username - username to authenticate on server. probably playerName
     * @param   {string} args.password - password to authenticate on server.
     * @param   {string} args.gameName - name of the game
     * @param   {function} args.success - callback for if the authentication is successful
     * @param   {function} args.failure - callback for if the authentication failed
     */
    authenticate: function(args) {
        if(!this.check) { // then we don't care to check authentication! just call the success function
            args.success();
            return;
        }

        if(!args || !args.gameName || !args.username || !args.password || !args.success) {
            throw {message:"Missing argument(s)"};
        }

        var httpOptions = extend(this._baseRequest);

        var shasum = crypto.createHash("sha1");
        shasum.update(args.password);
        var encryptedPassword = shasum.digest("hex");

        httpOptions.path += "?" + querystring.stringify({
            l: args.username,
            p: encryptedPassword,
            c: args.gameName,
        });

        http.request(httpOptions, function(response) {
            if(response.statusCode === 200) { // OK
                args.success();
            }
            else {
                if(args.failure) {
                    args.failure();
                }
            }
        }).end();
    }
});

module.exports = Authenticator
