var log = require("./log");
var Class = require(__basedir + "/utilities/class");
var Client = require("./client");
var EOT_CHAR = String.fromCharCode(4); // end of transmition character, used to signify the string we sent is the end of a transmition and to parse the json string before it, because some socket APIs for clients will concat what we send

/*
 * @class
 * @classdesc A client to the game server via a TCP socket
 * @extends Client
 */
var TCPClient = Class(Client, {
    init: function(socket /*,  ... */) {
        this._buffer= ""; // TCP clients may send their json in parts, delimited by the EOT_CHAR. We buffer it here.
        socket.setEncoding('utf8');

        Client.init.apply(this, arguments);
    },

    /**
     * @override
     */
    _onSocketData: function(data) {
        Client._onSocketData.apply(this, arguments);

        this._buffer += data;
        var split = this._buffer.split(EOT_CHAR); // split on "end of text" character (basically end of transmition)
        this._buffer = split.pop(); // the last item will either be "" if the last char was an EOT_CHAR, or a partial data we need to store in the buffer anyways

        for(var i = 0; i < split.length; i++) {
            var parsed = this._parseData(split[i]);
            if(!parsed) {
                return; // because we got some invalid data, so we're going to fatally disconnect anyways
            }

            this.server.clientSentData(this, parsed);
        }
    },

    /**
     * @override
     */
    _sendRaw: function(str) {
        Client._sendRaw.apply(this, arguments);

        this.socket.write(str + EOT_CHAR);
    },

    /**
     * @override
     */
    disconnected: function() {
        Client.disconnected.apply(this, arguments);

        this.socket.destroy();
        delete this.socket;
    },
});

module.exports = TCPClient;
