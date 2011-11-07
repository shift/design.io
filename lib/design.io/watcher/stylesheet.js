(function() {
  var Shift, fs, _path;
  Shift = require('shift');
  _path = require('path');
  fs = require('fs');
  module.exports = function(options) {
    var Watcher;
    Watcher = require("" + (process.cwd()) + "/lib/design.io/watcher");
    return Watcher.create(options.extensions, {
      create: function(path) {
        return this.update(path);
      },
      update: function(path) {
        var self;
        self = this;
        return fs.readFile(path, 'utf-8', function(error, result) {
          var engine;
          engine = Shift.engine(_path.extname(path));
          if (engine) {
            return engine.render(result, function(error, result) {
              if (error) {
                return self.error(error);
              }
              return self.broadcast({
                path: path,
                body: result,
                id: self.toId(path)
              });
            });
          } else {
            return self.broadcast({
              path: path,
              body: result,
              id: self.toId(path)
            });
          }
        });
      },
      "delete": function(path) {
        return this.broadcast({
          id: this.id(path)
        });
      },
      client: {
        update: function(data) {
          var node, stylesheets;
          stylesheets = this.stylesheets || (this.stylesheets = {});
          if (stylesheets[data.id] != null) {
            stylesheets[data.id].remove();
          }
          node = $("<style id='" + data.id + "' type='text/css'>" + data.body + "</style>");
          stylesheets[data.id] = node;
          return $("body").append(node);
        },
        destroy: function(data) {
          return $("#" + data.id).remove();
        }
      },
      server: {}
    });
  };
}).call(this);
