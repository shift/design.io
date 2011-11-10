(function() {
  var app, command, connect, designIO, designer, express;
  connect = require('connect');
  express = require('express');
  designIO = require('../design.io');
  command = new (require("./command"))(process.argv);
  command.run();
  app = express.createServer();
  designer = require('./connection')(require('socket.io').listen(app));
  app.listen(command.program.port);
  app.use(connect.bodyParser());
  app.post('/design.io/:action', function(request, response) {
    designer.emit(request.params.action, request.body);
    return response.send(request.params.action);
  });
}).call(this);
