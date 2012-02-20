(function() {
  var Watcher, app, coffee, command, connect, designer, express, io;

  command = new (require("./command"))(process.argv);

  io = require('socket.io');

  express = require("express");

  connect = require('connect');

  Watcher = require("../../lib/design.io/watcher");

  app = express.createServer();

  coffee = require('coffee-script');

  designer = require('../../lib/design.io/connection')(require('socket.io').listen(app));

  app.listen(command.program.port);

  app.use(express.static(__dirname + '/../..'));

  app.use(connect.bodyParser());

  app.post('/design.io/:event', function(request, response) {
    designer.emit(request.params.event, JSON.stringify(request.body));
    return response.send(request.params.event);
  });

  app.get("design.io", function(request, response) {});

  _console.info("Design.io started on port " + command.program.port);

}).call(this);
