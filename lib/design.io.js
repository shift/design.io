(function() {
  var command, exec, server, spawn, _ref;
  _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;
  command = new (require("" + __dirname + "/design.io/command"))(process.argv);
  server = spawn("node", ["" + __dirname + "/design.io/server"]);
  server.stdout.on('data', function(data) {
    return console.log(data.toString().trim());
  });
  server.stderr.on('data', function(data) {
    return console.log(data.toString().trim());
  });
  command = new (require("" + __dirname + "/design.io/command"));
  require("" + __dirname + "/design.io/watcher").initialize({
    watchfile: command.program.watchfile,
    directory: command.program.directory,
    port: command.program.port
  });
}).call(this);
