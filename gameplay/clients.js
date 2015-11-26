clientClasses = {
    WS: require("./wsClient"),
    TCP: require("./tcpClient"),
};

for(var key in clientClasses) {
    if(clientClasses.hasOwnProperty(key)) {
        clientClasses[key].prototype.connectionType = key;
    }
}

module.exports = clientClasses;
