(function() {
  var app, command, designer;

  command = new (require("./command"))(process.argv);

  command.run();

  app = require("http").createServer(function(request, response) {
    var action;
    action = request.url.split("/");
    action = action[action.length - 1];
    designer.emit(action, request.body);
    response.writeHead(200, {
      "Content-Type": "application/json"
    });
    response.write(action);
    return response.end();
  });

  designer = require('./connection')(require('socket.io').listen(app));

  app.listen(command.program.port);

}).call(this);
