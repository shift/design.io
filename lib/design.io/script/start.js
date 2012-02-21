(function() {
  var Hook, Watcher, command, connect, designer, express, hook, io;

  command = require(__dirname)(process.argv);

  Hook = require("hook.io").Hook;

  io = require('socket.io');

  express = require("express");

  connect = require('connect');

  io = require('socket.io').listen(app);

  designer = io.of("/design.io");

  Watcher = require("../../lib/design.io/watcher");

  designer.on("connection", function(socket) {
    socket.on("userAgent", function(data) {
      return socket.set("userAgent", data, function() {
        socket.emit("ready");
        Watcher.connect();
        return true;
      });
    });
    socket.on("log", function(data) {
      Watcher.log(data);
      return true;
    });
    return socket.on("disconnect", function() {
      return socket.emit("user disconnected");
    });
  });

  app.listen(command.program.port);

  app.use(express.static(__dirname + '/../..'));

  app.use(connect.bodyParser());

  hook = new Hook({
    name: "design.io-server",
    debug: true
  });

  hook.on("hook::ready", function(data) {
    return console.log("hook started");
  });

  hook.on("design.io-watcher::change", function(data) {
    var action, date, path, root, slug;
    action = data.action, date = data.date, path = data.path, root = data.root, slug = data.slug;
    return designer.broadcast(action, JSON.stringify(data));
  });

  hook.start();

  app.get("design.io", function(request, response) {});

  _console.info("Design.io started on port " + command.program.port);

}).call(this);
