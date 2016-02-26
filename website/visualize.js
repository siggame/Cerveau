// Visualize - a simple visualizer

var app = require("./app");

module.exports = function(args) {
    app.get('/visualize/:filename', function(req, res) {
        res.render('visualize', req.params);
    });
};
