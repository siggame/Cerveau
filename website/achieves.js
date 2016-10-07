var app = require("./app");
var getGameInfos = require("./getGameInfos");
var formatGamelogs = require("./formatGamelogs");

module.exports = function(args) {
    app.get("/archives/:gameName?/:pageStart?/:pageCount?", function(req, res) {
        var gameName = req.params.gameName || "all";

        var pageStart = req.params.pageStart !== undefined ? parseInt(req.params.pageStart) : NaN;
        if(isNaN(pageStart)) {
            pageStart = 1; // starting page
        }

        var pageCount = req.params.pageCount !== undefined ? parseInt(req.params.pageCount) : NaN;
        if(isNaN(pageCount)) {
            pageCount = 20; // default page count
        }

        var lobby = args.lobby;
        lobby.gameLogger.getLogs(function(logs) {
            var gamelogs = [];

            var startIndex = logs.length - (pageStart * pageCount);
            var endIndex = startIndex + pageCount;
            startIndex = Math.max(startIndex, 0);

            // because logs (all the gamelogs GameLogger found) is pre-sorted with the newest gamelogs at the END, startIndex starts at the end. We want to first show the NEWEST gamelogs
            for(var i = endIndex - 1; i >= startIndex; i--) {
                gamelogs.push(logs[i]);
            }

            var newerUri;
            if(endIndex < logs.length) {
                newerUri = "/archives/" + gameName + "/" + (pageStart - 1);
            }

            var olderUri;
            if(startIndex > 0) {
                olderUri = "/archives/" + gameName + "/" + (pageStart + 1);
            }

            res.render("archives", {
                gamelogs: formatGamelogs(gamelogs),
                newerUri: newerUri,
                olderUri: olderUri,
            });
        });
    });
};
