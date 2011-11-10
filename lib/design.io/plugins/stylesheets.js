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
      args[0] = /\.(styl|less|css|sass|scss)$/;
    }
    if (options.hasOwnProperty("compress") && options.compress === true) {
      compressor = new Shift.YuiCompressor;
    }
    return Watcher.create(args, {
      update: function(path) {
        var self;
        self = this;
        fs.readFile(path, 'utf-8', function(error, result) {
          var engine;
          engine = Shift.engine(_path.extname(path));
          if (engine) {
            return engine.render(result, function(error, result) {
              if (error) {
                return self.error(error);
              }
              if (compressor) {
                return compressor.render(result, function(error, result) {
                  if (error) {
                    return self.error(error);
                  }
                  return self.broadcast({
                    body: result
                  });
                });
              } else {
                return self.broadcast({
                  body: result
                });
              }
            });
          } else {
            if (compressor) {
              compressor.render(result, function(error, result) {
                if (error) {
                  return self.error(error);
                }
                return self.broadcast({
                  body: result
                });
              });
            }
            return self.broadcast({
              body: result
            });
          }
        });
        return true;
      },
      client: {
        connect: function() {
          return this.stylesheets = {};
        },
        update: function(data) {
          var node, stylesheets;
          stylesheets = this.stylesheets;
          if (stylesheets[data.id] != null) {
            stylesheets[data.id].remove();
          }
          node = $("<style id='" + data.id + "' type='text/css'>" + data.body + "</style>");
          stylesheets[data.id] = node;
          return $("body").append(node);
        },
        "delete": function(data) {
          if (this.stylesheets[data.id] != null) {
            return this.stylesheets[data.id].remove();
          }
        }
      }
    });
  };
}).call(this);