(function() {
  var Shift, fs, _path;
  Shift = require('shift');
  _path = require('path');
  fs = require('fs');
  module.exports = function(options) {
    var compressor, patterns;
    if (options == null) {
      options = {};
    }
    patterns = options.patterns || [/\.(coffee|ejs|js)$/];
    if (options.hasOwnProperty("compress") && options.compress === true) {
      compressor = new Shift.UglifyJS;
    }
    return Watcher.create(patterns, {
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
              if (compressor) {
                return compressor.render(result, function(error, result) {
                  if (error) {
                    return self.error(error);
                  }
                  return self.broadcast({
                    id: self.toId(path),
                    path: path,
                    body: result
                  });
                });
              } else {
                return self.broadcast({
                  id: self.toId(path),
                  path: path,
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
                  path: path,
                  body: result,
                  id: self.toId(path)
                });
              });
            }
            return self.broadcast({
              id: self.toId(path),
              path: path,
              body: result
            });
          }
        });
      },
      "delete": function(path) {
        return this.broadcast({
          id: this.toId(path),
          path: path
        });
      },
      client: {
        update: function(data) {
          var javascripts, node;
          javascripts = this.javascripts || (this.javascripts = {});
          if (javascripts[data.id] != null) {
            javascripts[data.id].remove();
          }
          node = $("<script id='" + data.id + "' type='text/javascript'>" + data.body + "</script>");
          javascripts[data.id] = node;
          return $("body").append(node);
        },
        destroy: function(data) {
          if (javascripts[data.id] != null) {
            return javascripts[data.id].remove();
          }
        }
      },
      server: {}
    });
  };
}).call(this);
