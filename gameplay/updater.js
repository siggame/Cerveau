const Classe = require("classe");
const Git = require("simple-git");
const request = require("request");
const hostedGitInfo = require("hosted-git-info");

const log = require("./log");

const Updater = Classe({
    init: function(options) {
        options = options || {};
        this.pollRate = options.pollRate || 60000; // default to 1 min per poll
        this.autoupdate = true;
        if(Object.hasOwnProperty.call(options, "autoupdate")) {
            this.autoupdate = Boolean(options.autoupdate);
        }

        let packageJson = null;
        try {
            packageJson = require(`${__basedir}/package.json`);
        }
        catch(err) {
            return this._die("Could not require package.json for Updater");
        }

        let hostedInfo = null;
        if(packageJson && packageJson.repository && packageJson.repository.url) {
            hostedInfo = hostedGitInfo.fromUrl(packageJson.repository.url);
        }

        if(!hostedInfo) {
            return this._die("package.json has malformed repository url to check for updates");
        }

        if(!hostedInfo.type === "github" || !hostedInfo.user || !hostedInfo.project) {
            return this._die("package.json's repository url does not appear to be a valid repo.");
        }

        this._githubURL = `http://api.github.com/repos/${hostedInfo.user}/${hostedInfo.project}/commits`;

        // our git repo will be... ourself!
        this._git = Git(__basedir);
        this._git.status((err, status) => {
            if(err) {
                return this._die("Error trying to use Git, is it installed on your system?");
            }

            if(status.tracking !== "origin/master") {
                return this._die("Not on origin/master, updater disabled");
            }

            // looks good, let's go to work
            this._cacheCommits(() => {
                this._check();
            });
        });
    },

    /**
     * Caches commits so we don't re-parse the commits every time we check GitHub against our commits
     * @param {Function} [callback] - optional callback to invoke after caching is done
     */
    _cacheCommits: function(callback) {
        this._git.log((err, gitlog) => {
            this._commits = new Set();

            for(const aLog of gitlog.all) {
                this._commits.add(aLog.hash);
            }

            if(callback) {
                callback();
            }
        });
    },

    /**
     * Does a request to GitHub to check if we are up to date
     */
    _check: function() {
        request({
            url: this._githubURL,
            headers: {"User-Agent": "node.js"},
        }, (err, response, body) => {
            if(!err && response.statusCode === 200) {
                const githubCommits = JSON.parse(body);
                if(githubCommits && githubCommits.length > 0) {
                    const latestHash = githubCommits[0].sha;
                    if(!this._commits.has(latestHash)) {
                        // then we don't have the latest commit on github, so try to autoupdate
                        this._tryToUpdate();
                    }
                    // else, we are up to date
                }
                // else commits look wrong... ignore
            }
            // else there was an error, disregard and try again

            // check again later
            this._delayedCheck();
        });
    },

    /**
     * Does a delayed _check by the pollrate
     */
    _delayedCheck: function() {
        if(!this.dead) {
            this._timeout = setTimeout(() => {
                this._check();
            }, this.pollRate);
        }
    },

    /**
     * Tries to auto-update this repo is an update was found
     */
    _tryToUpdate: function() {
        this._foundUpdates = true;

        if(!this.autoupdate) {
            log.warning("Update found on GitHub, but autoupdate is disabled. Manually update please!");
            return; // autoupdate is disabled
        }

        log.warning("Update found on GitHub, attempting to pull down now!");
        this._git.pull("origin", "master", (err) => {
            if(err) {
                log.error("Error auto updating from GitHub. This git repo may be borked!", err);
                this._die();
            }
            else {
                log.warning("Auto Update applied. You may want to restart Cerveau if the update changed the base components, otherwise game changes will be reflected in the next run of that game automatically.");
                this._foundUpdates = false; // as we applied them

                // then re-cache the commits now that they are updated
                this._cacheCommits();
            }
        });
    },

    /**
     * Stops the auto-updater and all future update checks
     * @param {string} [warningMessage] - optional message to display to user warning them why we got disabled
     */
    _die: function(warningMessage) {
        if(warningMessage) {
            log.warning(`Updater Warning: ${warningMessage}`);
        }

        if(this._timeout) {
            clearTimeout(this._timeout);
        }

        this.dead = true;
    },

    /**
     * Checks if the Updater has found updates and they are not applied
     *
     * @return {boolean} true if found updates, false otherwise
     */
    foundUpdates() {
        return Boolean(this._foundUpdates);
    },
});

module.exports = Updater;
