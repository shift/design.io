(function() {
  var Hook, Project, app, command, connect, express, hook, io;

  command = require(__dirname)(process.argv);

  Hook = require("hook.io").Hook;

  io = require('socket.io');

  express = require("express");

  connect = require('connect');

  app = express.createServer();

  io = require('socket.io').listen(app);

  Project = require("../project");

  io.set('log level', 1);

  io.on("connection", function(socket) {
    socket.on("userAgent", function(data) {
      socket.room = data.namespace;
      socket.join(data.namespace);
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
      socket.emit("user disconnected");
      return socket.leave(socket.room);
    });
  });

  app.listen(command.port);

  app.use(express.static(__dirname + '/../..'));

  app.use(connect.bodyParser());

  hook = new Hook({
    name: "design.io-server",
    debug: false,
    silent: true,
    m: false
  });

  hook.on("hook::ready", function(data) {
    return _console.info("Design.io started on port " + command.port);
  });

  hook.on("*::exec", function(data, callback, event) {
    if (!event.name.match("design.io-watcher")) return;
    return io.sockets["in"](data.namespace).emit(data.action, JSON.stringify(data));
  });

  hook.start();

  app.get("design.io", function(request, response) {});

}).call(this);
