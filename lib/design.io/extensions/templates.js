(function() {
  var Shift, fs, _path;

  Shift = require('shift');

  _path = require('path');

  fs = require('fs');

  module.exports = function() {
    var args, options;
    args = Array.prototype.slice.call(arguments, 0, arguments.length);
    options = typeof args[args.length - 1] === "object" ? args.pop() : {};
    if (!(args.length > 0)) args[0] = /\.(jade|mustache|haml|erb|coffee)$/;
    return Watcher.create(args, {
      update: function(path) {
        var self;
        self = this;
        fs.readFile(path, 'utf-8', function(error, result) {
          return Shift.render({
            path: path,
            string: result
          }, function(error, output) {
            if (error) return self.error(error);
            return self.broadcast({
              body: output
            });
          });
        });
        return true;
      }
    });
  };

}).call(this);
