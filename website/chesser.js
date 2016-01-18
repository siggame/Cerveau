// Chesser - basically a very fancy chess visualizer and human playable client

var app = require("./app");
var extend = require("extend");

module.exports = function(args) {
    app.get('/chesser/:filename?', function(req, res) {
        res.render('chesser', extend({
            defaultHost: args.host || "localhost",
            defaultWSPort: args.wsPort,
        }, req.params));
    });
};
