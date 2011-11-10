(function() {
  var exec;
  exec = require('child_process').exec;
  module.exports = function() {
    var args, command, options;
    args = Array.prototype.slice.call(arguments, 0, arguments.length);
    options = typeof args[args.length - 1] === "object" ? args.pop() : {};
    if (!(args.length > 0)) {
      args[0] = /.*/;
    }
    if (!options.server) {
      throw new Error("You must specify the restart command: require('design.io/reload')(command: 'node app.js')");
    }
    command = options.command;
    return Watcher.create(args, {
      update: function(path) {
        return exec('ps aux | grep node', function(e, stdout, o) {
          var line, lines, match, pid, _i, _len, _results;
          lines = stdout.toString().split("\n");
          _results = [];
          for (_i = 0, _len = lines.length; _i < _len; _i++) {
            line = lines[_i];
            _results.push(line.match(server) ? (match = line.match(/[^ ]+ +(\d+)/), match ? (pid = match[1], exec("kill -2 " + pid), exec(command), console.log("Server restarted... " + command)) : void 0) : void 0);
          }
          return _results;
        });
      }
    });
  };
}).call(this);
