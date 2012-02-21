(function() {
  var command, forever;

  global._console || (global._console = require("underscore.logger"));

  forever = require("forever");

  command = function(argv) {
    var program, slug;
    program = require("commander");
    program.option("-d, --directory [value]", "directory to watch files from").option("-w, --watchfile [value]", "location of Watchfile").option("-p, --port <n>", "port for the socket connection").option("-u, --url [value]", "URL for the socket connection").option("-i, --interval <n>", "interval (in milliseconds) files should be scanned (only useful if you can't use FSEvents).  Not implemented").option("-n, --namespace [value]", "Namespace for the project").parse(process.argv);
    program.directory || (program.directory = process.cwd());
    program.watchfile || (program.watchfile = "Watchfile");
    program.port = program.port ? parseInt(program.port) : process.env.PORT || 4181;
    program.url || (program.url = "http://localhost:" + program.port);
    program.command = program.args[0] || "watch";
    program.root = process.cwd();
    if (!program.namespace) {
      slug = process.cwd().split("/");
      slug = slug[slug.length - 1];
      slug = slug.replace(/\.[^\.]+$/, "");
      program.namespace = slug;
    }
    return program;
  };

  command.run = function(argv) {
    var child, program;
    program = command(argv);
    child = (function() {
      switch (program.command) {
        case "start":
          return forever.start(["node", "" + __dirname + "/command/start.js"], {
            silent: true,
            max: 1
          });
        case "stop":
          return forever.start(["node", "" + __dirname + "/command/stop.js"], {
            silent: true,
            max: 1
          });
        default:
          return forever.start(["node", "" + __dirname + "/command/watch.js"], {
            silent: false
          });
      }
    })();
    child.on("start", function() {});
    child.on("exit", function() {});
    child.on("stdout", function(data) {
      return console.log(data.toString());
    });
    child.on("stderr", function() {});
    child.on("error", function() {});
    forever.startServer(child);
    return program;
  };

  module.exports = command;

}).call(this);
