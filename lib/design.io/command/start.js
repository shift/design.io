(function() {
  var Hook, Project, app, command, connect, designer, express, hook, io;

  command = require(__dirname)(process.argv);

  Hook = require("hook.io").Hook;

  io = require('socket.io');

  express = require("express");

  connect = require('connect');

  app = express.createServer();

  io = require('socket.io').listen(app);

  designer = io.of("/design.io");

  Project = require("../project");

  designer.on("connection", function(socket) {
    socket.on("userAgent", function(data) {
      return socket.set("userAgent", data, function() {
        socket.emit("ready");
        Project.find(data.namespace).connect();
        return true;
      });
    });
    socket.on("log", function(data) {
      Project.find(data.namespace).log(data);
      return true;
    });
    return socket.on("disconnect", function() {
      return socket.emit("user disconnected");
    });
  });

  app.listen(command.port);

  app.use(express.static(__dirname + '/../..'));

  app.use(connect.bodyParser());

  hook = new Hook({
    name: "design.io-server",
    debug: true
  });

  hook.on("hook::ready", function(data) {
    return console.log("hook started");
  });

  hook.on("design.io-watcher::initialized", function(data) {
    var action, namespace, paths;
    action = data.action, paths = data.paths, namespace = data.namespace;
    return designer.broadcast(action, JSON.stringify(data));
  });

  hook.on("design.io-watcher::changed", function(data) {
    var action, current, namespace, path, previous, timestamp;
    console.log("design.io-watcher!!!");
    console.log(data);
    action = data.action, timestamp = data.timestamp, previous = data.previous, current = data.current, path = data.path, namespace = data.namespace;
    return designer.broadcast(action, JSON.stringify(data));
  });

  hook.start();

  app.get("design.io", function(request, response) {});

  _console.info("Design.io started on port " + command.port);

}).call(this);
