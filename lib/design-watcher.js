(function() {
  var Shift, fs, path, program, watch;
  fs = require('fs');
  path = require('path');
  Shift = require('shift');
  watch = require('watch-node');
  program = require('commander');
  program.option('-w, --watch [value]', 'directory to watch files from').parse(process.argv);
  watch(program.watch, function(file) {
    var id;
    id = file.replace(process.cwd() + '/', '').replace(/[\/\.]/g, '-');
    return fs.readFile(file, 'utf-8', function(error, content) {
      var emit, engine, extension, outputExtension;
      if (error) {
        throw error;
      }
      extension = path.extname(file);
      engine = Shift.engine(extension);
      outputExtension = (function() {
        switch (extension) {
          case ".coffee":
          case ".ejs":
          case ".js":
            return "js";
          case ".styl":
          case ".less":
          case ".sass":
          case ".css":
            return "css";
        }
      })();
      emit = function(output) {
        var data, params, request;
        request = require('request');
        data = {};
        data[outputExtension] = {
          body: output,
          path: file,
          id: id
        };
        params = {
          url: 'http://localhost:4181',
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json"
          }
        };
        console.log(data);
        return request(params, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            return console.log(body);
          } else {
            return console.log(error);
          }
        });
      };
      if (engine) {
        return engine.render(content, function(error, output) {
          return emit(output);
        });
      } else {
        return emit(content);
      }
    });
  });
}).call(this);
