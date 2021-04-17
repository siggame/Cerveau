define({ "api": [
  {
    "group": "API",
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "src/web/routes/status.ts",
    "groupTitle": "API",
    "name": ""
  },
  {
    "type": "get",
    "url": "/gamelog/:filename/",
    "title": "Gamelog",
    "name": "Get_Gamelog",
    "group": "API",
    "description": "<p>Simply given the id of a gamelog, responds with the gamelog If found. See <a href=\"https://github.com/siggame/Cadre/blob/master/gamelog-format.md\">Gamelog formatting documentation</a> for more information.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "filename",
            "description": "<p>The filename (with no extension) of the gamelog, this is sent to clients when a game is over, and in status when a game is over. Optionally can also be the string &quot;latest&quot;, to get the latest gamelog logged, if there is any.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Gamelog found",
          "content": "{\n     \"gameName\": \"Anarchy\",\n     \"gameSession\": \"1\",\n     \"constants\": { \"DELTA_REMOVED\": \"&RM\",\"DELTA_LIST_LENGTH\": \"&LEN\" },\n     \"deltas\": [ \"A bunch of delta objects, not this string\" ],\n     \"epoch\": 1525474117946,\n     \"winners\":[\n         {\n             \"index\": 1,\n             \"id\": \"1\",\n             \"name\":\n             \"Anarchy Lua Player\",\n             \"reason\": \"Max turns reached (200) - You had the most buildings not burned down.\",\n             \"disconnected\": false,\n             \"timedOut\": false\n         }\n     ],\n     \"losers\":[\n         {\n             \"index\": 0,\n             \"id\": \"0\",\n             \"name\": \"Anarchy JavaScript Player\",\n             \"reason\": \"Max turns reached (200) - You had more buildings burned down than another player.\",\n             \"disconnected\": false,\n             \"timedOut\": false\n         }\n     ],\n     \"settings\":{\n         \"key\": \"value pairs of all the game settings used to initialize the game.\"\n     }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "404 Error": [
          {
            "group": "404 Error",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>If the gamelog was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Gamelog not found",
          "content": "{\n    \"error\": \"Gamelog not found.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/web/routes/gamelog.ts",
    "groupTitle": "API"
  },
  {
    "type": "get",
    "url": "/gamelogs",
    "title": "Gamelogs",
    "name": "Get_Gamelogs",
    "group": "API",
    "description": "<p>Gets a list of gamelog ids (filenames) that are available to get.</p>",
    "success": {
      "examples": [
        {
          "title": "Gamelogs found",
          "content": "[\n  \"2018.03.07.15.28.57.858-Anarchy-2.json.gz\",\n  \"2018.04.25.14.35.18.795-Chess-1.json.gz\",\n  \"2018.05.25.11.06.21.462-Spiders-Foo.json.gz\"\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/web/routes/gamelogs.ts",
    "groupTitle": "API"
  },
  {
    "type": "post",
    "url": "/setup/",
    "title": "Setup",
    "name": "Setup_game_session",
    "group": "API",
    "description": "<p>Sets up (reserves) a game session for specific clients to play. Intended to be used <strong>only</strong> by the Arena, as this is disabled in normal play. The POST body <strong>must</strong> be valid JSON.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "gameName",
            "description": "<p>The name of the game (or alias) that the clients will be playing.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "session",
            "description": "<p>The id of the session to setup. Must not conflict with any other sessions, and clients will need to connect to this id when connecting to the game server after this succeeds. when a game is over, and in status when a game is over.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "password",
            "description": "<p>An optional string to password protect the room setting up. When set all clients connecting must provide this same password to connect.</p>"
          },
          {
            "group": "Parameter",
            "type": "GameSettings",
            "optional": false,
            "field": "gameSettings",
            "description": "<p>A key/value object of valid game settings for the game. The only <strong>required</strong> gameSettings are <code>playerNames</code>.</p>"
          },
          {
            "group": "Parameter",
            "type": "string[]",
            "optional": false,
            "field": "gameSettings.playerNames",
            "description": "<p>An array of strings to force the clients player names to be. Must be an array of the exact same length as the number of players for the game. When clients connect these names will override the name they claim to use. So connect them in order of who they are. (e.g. Player 0 should connect first to get the first name). game-settings.ts file for more information.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success Response",
          "content": "{}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "400 Error": [
          {
            "group": "400 Error",
            "optional": false,
            "field": "error",
            "description": "<p>A human readable message explaining why the sent parameters do not work to setup a game session. No game session will be set up in this case.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Response",
          "content": "{\n    \"error\": \"gameName 'undefined' is not a known game alias\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/web/routes/setup.ts",
    "groupTitle": "API"
  },
  {
    "type": "get",
    "url": "/status/:gameName/:gameSession",
    "title": "Status",
    "name": "Status",
    "group": "API",
    "description": "<p>When given a gameName and session id, responds with json data about what is going on in that game session, including what clients are connected.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "gameName",
            "description": "<p>The name of the game (or an alias), must be a valid game on the server.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "gameSession",
            "description": "<p>The session id of the game you want to check the status of.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "gameName",
            "description": "<p>The actual name of the game, e.g. &quot;chess&quot; -&gt; &quot;Chess&quot;.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "gameSession",
            "description": "<p>The id of the session in that game.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "gamelogFilename",
            "description": "<p>The filename (id) of the gamelog. To get the actual gamelog use the /gamelog/:id part of the API. null means the gamelog does not exist yet because it is still being written to the filesystem.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "status",
            "description": "<p>What the status of this game session is:</p> <ul> <li>&quot;empty&quot; if the game session is valid, but does not exist because no clients have ever connected to it.</li> <li>&quot;open&quot; if the game session has had a least 1 client connect, but the game has not started.</li> <li>&quot;running&quot; if all players have connected, and the game is actively in progress, but not over.</li> <li>&quot;over&quot; if the game session has ran to completion and clients have disconnected.</li> <li>&quot;error&quot; otherwise, such as if the gameName was invalid.</li> </ul>"
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "numberOfPlayers",
            "description": "<p>The number of clients that are playing needed to connect to make the game session start running.</p>"
          },
          {
            "group": "Success 200",
            "type": "Client[]",
            "optional": false,
            "field": "clients",
            "description": "<p>An array of clients currently in that game session.</p>"
          }
        ],
        "Client": [
          {
            "group": "Client",
            "type": "number",
            "optional": true,
            "field": "index",
            "description": "<p>If the player requested, or was assigned, a player index. When a game session reaches &quot;running&quot; this will be set.</p>"
          },
          {
            "group": "Client",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>The name of the client.</p>"
          },
          {
            "group": "Client",
            "type": "boolean",
            "optional": false,
            "field": "spectating",
            "description": "<p>If the client is a spectator (not a playing client). Spectators will not have indexes.</p>"
          },
          {
            "group": "Client",
            "type": "boolean",
            "optional": true,
            "field": "disconnected",
            "description": "<p>If the client disconnected unexpectedly during the game.</p>"
          },
          {
            "group": "Client",
            "type": "boolean",
            "optional": true,
            "field": "timedOut",
            "description": "<p>If the client timedOut and we were forced to disconnect them during the game.</p>"
          },
          {
            "group": "Client",
            "type": "boolean",
            "optional": true,
            "field": "won",
            "description": "<p>If the player won this will be set, and be true.</p>"
          },
          {
            "group": "Client",
            "type": "boolean",
            "optional": true,
            "field": "lost",
            "description": "<p>If the player lost this will be set, and be true.</p>"
          },
          {
            "group": "Client",
            "type": "string",
            "optional": true,
            "field": "reason",
            "description": "<p>If the player won or lost this will be the human readable reason why they did so.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Empty",
          "content": "{\n    status: \"empty\",\n    gameName: \"Chess\",\n    gameSession: \"1\",\n    requiredNumberOfPlayers: 2\n}",
          "type": "json"
        },
        {
          "title": "Open",
          "content": "{\n    status: \"open\",\n    gameName: \"Chess\",\n    gameSession: \"1\",\n    requiredNumberOfPlayers: 2,\n    clients: [\n        {\n            name: \"Chess Lua Player\",\n            spectating: false\n        }\n    ]\n }",
          "type": "json"
        },
        {
          "title": "Running",
          "content": "{\n    status: \"running\",\n    gameName: \"Chess\",\n    gameSession: \"1\",\n    requiredNumberOfPlayers: 2,\n    clients: [\n        {\n            name: \"Chess Lua Player\",\n            spectating: false\n        },\n        {\n            name: \"Chess Python Player\",\n            spectating: false\n        }\n    ]\n}",
          "type": "json"
        },
        {
          "title": "Over",
          "content": "{\n    status: \"over\",\n    gameName: \"Chess\",\n    gameSession: \"1\",\n    gamelogFilename: \"2016.03.01.11.54.30.868-Chess-1\",\n    requiredNumberOfPlayers: 2,\n    clients: [\n        {\n            name: \"Chess Lua Player\",\n            index: 0,\n            spectating: false,\n            won: true,\n            lost: false,\n            reason: \"Checkmate!\"\n        },\n        {\n            name: \"Chess Python Player\",\n            index: 1,\n            spectating: false,\n            won: false,\n            lost: true,\n            reason: \"Checkmated.\"\n        }\n    ]\n}",
          "type": "json"
        },
        {
          "title": "Almost Over",
          "content": "// In this example the game is over, but the gamelog is still being\n// handled internally and is not available via the `gamelog/` API yet.\n{\n    status: \"over\",\n    gameName: \"Chess\",\n    gameSession: \"1\",\n    gamelogFilename: null,\n    requiredNumberOfPlayers: 2,\n    clients: [\n        {\n            name: \"Chess Lua Player\",\n            spectating: false,\n            won: true,\n            lost: false,\n            reason: \"Checkmate!\"\n        },\n        {\n            name: \"Chess Python Player\",\n            spectating: false,\n            won: false,\n            lost: true,\n            reason: \"Checkmated.\"\n        }\n    ]\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>A human readable string about what the error was.</p>"
          },
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": true,
            "field": "gameName",
            "description": "<p>If the request was valid, but the gameName was not a valid alias for a game, this is the gameName you sent us.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Unknown GameName",
          "content": "HTTP/1.1 400 Bad Request\n{\n    error: \"Game name not valid\",\n    gameName: \"unknownGameName\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/web/routes/status.ts",
    "groupTitle": "API"
  }
] });
