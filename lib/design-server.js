(function() {
  var app, broadcast, connect, designer, express, io;
  io = require('socket.io');
  connect = require('connect');
  express = require('express');
  app = express.createServer();
  io = io.listen(app);
  designer = null;
  app.listen(process.env.PORT || 4181);
  app.use(connect.bodyParser());
  app.post('/', function(request, response) {
    broadcast("update", request.body);
    return response.send('updated');
  });
  broadcast = function(name, data) {
    return io.sockets.socket(designer).emit(name, data);
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
