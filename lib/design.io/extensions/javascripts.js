(function() {
  var Shift, fs, _path;
  Shift = require('shift');
  _path = require('path');
  fs = require('fs');
  module.exports = function() {
    var args, compressor, options;
    args = Array.prototype.slice.call(arguments, 0, arguments.length);
    options = typeof args[args.length - 1] === "object" ? args.pop() : {};
    if (!(args.length > 0)) {
      args[0] = /\.(coffee|ejs|js)$/;
    }
    if (options.hasOwnProperty("compress") && options.compress === true) {
      compressor = new Shift.UglifyJS;
    }
    return Watcher.create(args, {
      update: function(path) {
        var self;
        self = this;
        return fs.readFile(path, 'utf-8', function(error, result) {
          return Shift.render({
            path: path,
            string: result
          }, function(error, output) {
            if (error) {
              return self.error(error);
            }
            if (compressor) {
              return compressor.render(output, function(error, result) {
                if (error) {
                  return self.error(error);
                }
                return self.broadcast({
                  body: result
                });
              });
            } else {
              return self.broadcast({
                body: output
              });
            }
          });
        });
      },
      client: {
        update: function(data) {
          return $("<script id='" + data.id + "' type='text/javascript'>" + data.body + "</script>");
        }
      }
    });
  };
}).call(this);
