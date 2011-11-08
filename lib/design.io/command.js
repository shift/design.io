(function() {
  var Command;
  Command = (function() {
    function Command(argv) {
      var program;
      this.program = program = require('commander');
      program.option('-d, --directory [value]', 'directory to watch files from').option('-w, --watchfile [value]', 'location of Watchfile').option('-p, --port <n>', 'port for the socket connect').option('-i, --interval <n>', 'interval (in milliseconds) files should be scanned (only useful if you can\'t use FSEvents).  Not implemented').parse(process.argv);
      program.directory || (program.directory = process.cwd());
      program.watchfile || (program.watchfile = "Watchfile");
      program.port = program.port ? parseInt(program.port) : 4181;
    }
    return Command;
  })();
  module.exports = Command;
}).call(this);
