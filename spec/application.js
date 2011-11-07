(function() {
  var Watcher, agents, app, broadcast, coffee, connect, express, io, jade, testSocket, _;
  io = require('socket.io');
  express = require("express");
  connect = require('connect');
  _ = require("underscore")._;
  Watcher = require("../lib/design.io/watcher");
  Watcher.initialize({
    watchfile: "Watchfile",
    directory: process.cwd(),
    port: 4181
  });
  app = express.createServer();
  io = io.listen(app);
  io.set('log level', 1);
  coffee = require('coffee-script');
  app.listen(4181);
  jade = require("jade");
  app.use(express.static(__dirname + '/..'));
  app.use(connect.bodyParser());
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/views');
  app.get('/', function(req, res) {
    return res.render('index.jade', {
      title: 'Spec Runner',
      address: app.settings.address,
      port: app.settings.port,
      pretty: true
    });
  });
  app.post('/:event', function(req, res) {
    broadcast(req.params.event, req.body);
    return res.send(req.params.event);
  });
  testSocket = null;
  agents = {};
  broadcast = function(name, data) {
    return io.sockets.socket(testSocket).emit(name, data);
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
