(function() {
  module.exports = function(portOrIo) {
    var Watcher, designer, io;
    if (typeof portOrIo === "object") {
      io = portOrIo;
    } else {
      io = require("socket.io").listen(port);
    }
    Watcher = require("./watcher");
    designer = io.of("/design.io");
    designer.on("connection", function(socket) {
      socket.on("userAgent", function(data) {
        return socket.set("userAgent", data, function() {
          socket.emit("ready");
          Watcher.connect();
          return true;
        });
      });
      socket.on("log", function(msg) {
        console.log(msg);
        return true;
      });
      return socket.on("disconnect", function() {
        return socket.emit("user disconnected");
      });
    });
    return designer;
  };
}).call(this);
