(function() {
  var agents, app, broadcast, coffee, connect, express, io, jade, testSocket, _;
  io = require('socket.io');
  express = require("express");
  connect = require('connect');
  _ = require("underscore")._;
  app = express.createServer();
  io = io.listen(app);
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
  app.post('/', function(req, res) {
    console.log("POSTED");
    console.log(req.body);
    broadcast("update", req.body);
    return res.send('updated');
  });
  testSocket = null;
  agents = {};
  broadcast = function(name, data) {
    console.log("BROADCAST " + name);
    return io.sockets.socket(testSocket).emit(name, data);
  };
  io.sockets.on('connection', function(socket) {
    socket.on('userAgent', function(data) {
      return socket.set('userAgent', data, function() {
        agents[socket.id] = data;
        testSocket = socket.id;
        socket.emit('ready');
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
