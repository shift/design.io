(function() {
  var exec, program, server, spawn, watcher, _ref;
  _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;
  program = require('commander');
  program.option('-w, --watch [value]', 'directory to watch files from').parse(process.argv);
  if (!program.watch) {
    throw new Error("You must pass a directory to the --watch [path] option");
  }
  server = spawn("node", ["" + __dirname + "/design-server"]);
  server.stdout.on('data', function(data) {
    return console.log(data.toString().trim());
  });
  server.stderr.on('data', function(data) {
    return console.log(data.toString().trim());
  });
  watcher = spawn("node", ["" + __dirname + "/design-watcher", "--watch", program.watch]);
  watcher.stdout.on('data', function(data) {
    return console.log(data.toString().trim());
  });
  watcher.stderr.on('data', function(data) {
    return console.log(data.toString().trim());
  });
}).call(this);
