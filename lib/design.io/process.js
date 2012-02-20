(function() {
  var command, file, forever, server;

  global._console || (global._console = require('underscore.logger'));

  forever = require("forever");

  command = new (require("" + __dirname + "/command"))(process.argv);

  file = "" + __dirname + "/server.js";

  switch (command.program.command) {
    case "start":
      server = forever.start(["node", file, "--watchfile", command.program.watchfile, "--directory", command.program.directory, "--port", command.program.port], {
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
      break;
    case "stop":
      forever.list(false, function(error, processes) {
        var index, process, _len, _results;
        _results = [];
        for (index = 0, _len = processes.length; index < _len; index++) {
          process = processes[index];
          if (process.file === file) {
            forever.stop(index);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      break;
    default:
      command.run();
  }

}).call(this);
