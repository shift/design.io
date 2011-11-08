(function() {
  var Watcher, agents, app, broadcast, command, connect, designer, express, io, testSocket;
  io = require('socket.io');
  connect = require('connect');
  express = require('express');
  command = new (require("./command"))(process.argv);
  Watcher = require("./watcher");
  Watcher.initialize({
    watchfile: command.program.watchfile,
    directory: command.program.directory,
    port: command.program.port
  });
  app = express.createServer();
  io = io.listen(app);
  io.set('log level', 1);
  designer = null;
  app.listen(process.env.PORT || 4181);
  app.use(connect.bodyParser());
  app.post('/:event', function(req, res) {
    broadcast(req.params.event, req.body);
    return res.send(req.params.event);
  });
  testSocket = null;
  agents = {};
  broadcast = function(name, data) {
    return io.sockets.emit(name, data);
  };
  io.sockets.on('connection', function(socket) {
    socket.on('userAgent', function(data) {
      return socket.set('userAgent', data, function() {
        agents[socket.id] = data;
        testSocket = socket.id;
        socket.emit('ready');
        Watcher.connect();
        return true;
      });
    });
    socket.on('log', function(msg) {
      if (testSocket != null) {
        io.sockets.socket(testSocket).emit("spec", msg);
      }
      socket.emit("spec", msg);
      return true;
    });
    return socket.on('disconnect', function() {
      return socket.emit('user disconnected');
    });
  });
}).call(this);
