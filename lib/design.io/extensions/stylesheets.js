(function() {
  var Shift, fs, _path;

  Shift = require('shift');

  _path = require('path');

  fs = require('fs');

  module.exports = function() {
    var args, compressor, options;
    args = Array.prototype.slice.call(arguments, 0, arguments.length);
    options = typeof args[args.length - 1] === "object" ? args.pop() : {};
    if (!(args.length > 0)) args[0] = /\.(styl|less|css|sass|scss)$/;
    if (options.hasOwnProperty("compress") && options.compress === true) {
      compressor = new Shift.YuiCompressor;
    }
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
            if (compressor) {
              return compressor.render(output, function(error, result) {
                if (error) return self.error(error);
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
        return true;
      },
      client: {
        connect: function() {
          return this.stylesheets = {};
        },
        update: function(data) {
          var node;
          if (this.stylesheets[data.id] != null) {
            this.stylesheets[data.id].remove();
          }
          node = $("<style id='" + data.id + "' type='text/css'>" + data.body + "</style>");
          this.stylesheets[data.id] = node;
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
