(function() {
  var Watcher, app, broadcast, connect, designer, express, io;
  io = require('socket.io');
  connect = require('connect');
  express = require('express');
  Watcher = require('./watcher');
  app = express.createServer();
  io = io.listen(app);
  designer = null;
  app.listen(process.env.PORT || 4181);
  app.use(connect.bodyParser());
  app.post('/:event', function(request, response) {
    broadcast(request.params.event, request.body);
    return response.send(request.params.event);
  });
  broadcast = function(name, data) {
    return io.sockets.broadcast(name, data);
  };
  io.sockets.on('connection', function(socket) {
    socket.on('userAgent', function(data) {
      return socket.set('userAgent', data, function() {
        designer = socket.id;
        socket.emit('ready');
        return true;
      });
    });
    return socket.on('disconnect', function() {
      return socket.emit('user disconnected');
    });
  });
}).call(this);
