(function() {
  var command, forever, server;

  global._console || (global._console = require('underscore.logger'));

  command = new (require("" + __dirname + "/command"))(process.argv);

  if (command.program.command === "start") {
    forever = require("forever");
    server = forever.start(["node", "" + __dirname + "/server.js", "--watchfile", command.program.watchfile, "--directory", command.program.directory, "--port", command.program.port], {
      max: 1,
      silent: true,
      killTree: true
    });
    server.on("stdout", function(data) {
      return console.log(data.toString().trim());
    });
    server.on("error", function(error) {
      return console.log(error);
    });
    server.on("exit", function() {
      return console.log("EXIT");
    });
    server.on("start", function(process, data) {
      return this;
    });
    server.on("stderr", function(data) {
      return _console.error(data.toString().trim());
    });
    forever.startServer(server);
  } else {
    command.run();
  }

}).call(this);
