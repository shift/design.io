(function() {
  var File, Pathfinder, Shift, Watcher, async, fs, path, request, uuid;

  fs = require('fs');

  path = require('path');

  uuid = require('node-uuid');

  async = require('async');

  Shift = require('shift');

  request = require('request');

  Pathfinder = require('pathfinder');

  File = Pathfinder.File;

  require('underscore.logger');

  Watcher = (function() {

    Watcher.initialize = function(options) {
      if (options == null) options = {};
      this.directory = options.directory;
      this.pathfinder = new Pathfinder(this.directory);
      this.watchfile = File.absolutePath(options.watchfile);
      this.port = options.port;
      this.url = options.url;
      if (!this.watchfile) throw new Error("You must specify the watchfile");
      if (!this.directory) {
        throw new Error("You must specify the directory to watch");
      }
      this.read(function() {
        return new (require('./listener/mac'))({
          root: Watcher.pathfinder.root,
          ignore: Watcher.ignoredPaths
        }, function(path, options) {
          return Watcher.changed(path, options);
        });
      });
      return this;
    };

    Watcher.read = function(callback) {
      var _this = this;
      Watcher.ignoredPaths = [];
      return fs.readFile(this.watchfile, "utf-8", function(error, result) {
        var Module, engine, mainModule, paths;
        engine = new Shift.CoffeeScript;
        mainModule = require.main;
        paths = mainModule.paths;
        mainModule.moduleCache && (mainModule.moduleCache = {});
        mainModule.filename = '.';
        if (process.binding('natives').module) {
          Module = require('module').Module;
          mainModule.paths = Module._nodeModulePaths(File.dirname(_this.watchfile));
        }
        return engine.render(result, function(error, result) {
          var context;
          context = "global.Watcher  = require('design.io/lib/design.io/watcher');\nvar __watchfile = new Watcher.Watchfile();\nvar watch       = __watchfile.watch;\nvar ignorePaths = __watchfile.ignorePaths;\n" + result + "\ndelete global.Watcher";
          mainModule._compile(context, mainModule.filename);
          if (callback) return callback.call(_this);
        });
      });
    };

    Watcher.store = function() {
      return this._store || (this._store = []);
    };

    Watcher.all = Watcher.store;

    Watcher.create = function() {
      return this.store().push((function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return typeof result === "object" ? result : child;
      })(this, arguments, function() {}));
    };

    Watcher.update = function() {
      return this.read(this.connect);
    };

    Watcher.connect = function() {
      return this.broadcast("watch", {
        body: this.toJSON()
      });
    };

    Watcher.toJSON = function() {
      var data, watcher, watchers, _i, _len;
      watchers = this.all();
      data = [];
      for (_i = 0, _len = watchers.length; _i < _len; _i++) {
        watcher = watchers[_i];
        data.push(watcher.toJSON());
      }
      return data;
    };

    Watcher.replacer = function(key, value) {
      if (value instanceof RegExp) {
        return "(function() { return new RegExp('" + value + "') })";
      } else if (typeof value === "function") {
        return "(" + value + ")";
      } else {
        return value;
      }
    };

    Watcher.reviver = function(key, value) {
      if (typeof value === "string" && !!value.match(/^(?:\(function\s*\([^\)]*\)\s*\{|\(\/)/) && !!value.match(/(?:\}\s*\)|\/\w*\))$/)) {
        return eval(value);
      } else {
        return value;
      }
    };

    Watcher.queue = async.queue(function(change, callback) {
      return Watcher.change(change.path, change.options, callback);
    }, 1);

    Watcher.timeout = 10 * 1000;

    Watcher.change = function(path, options, callback) {
      var action, duration, iterator, self, timestamp, watchers;
      watchers = this.all();
      action = options.action;
      timestamp = options.timestamp;
      self = this;
      duration = this.timeout;
      iterator = function(watcher, next) {
        var timeout, timeoutError, watcherCallback;
        if (watcher.match(path)) {
          watcher.path = path;
          watcher.action = action;
          watcher.timestamp = timestamp;
          watcherCallback = function(error) {
            clearTimeout(timeout);
            if (error) console.log(error.stack);
            return process.nextTick(next);
          };
          timeoutError = function() {
            return watcherCallback(new Error("Watcher for " + (watcher.patterns.toString()) + " timed out.  Make sure you have and call a callback in each watcher method (e.g. update: function(path, callback))"));
          };
          timeout = setTimeout(timeoutError, duration);
          try {
            switch (watcher[action].length) {
              case 0:
              case 1:
                watcher[action].call(watcher, path);
                return watcherCallback();
              case 2:
                return watcher[action].call(watcher, path, watcherCallback);
              case 3:
                return watcher[action].call(watcher, path, options, watcherCallback);
            }
          } catch (error) {
            return watcherCallback(error);
          }
        } else {
          return next();
        }
      };
      return async.forEachSeries(watchers, iterator, function(error) {
        return process.nextTick(callback);
      });
    };

    Watcher.changed = function(path, options) {
      if (options == null) options = {};
      return this.queue.push({
        path: path,
        options: options
      });
    };

    Watcher.log = function(data) {
      var action, timestamp, watcher, watchers, _i, _len, _results;
      watchers = this.all();
      path = data.path;
      action = data.action;
      timestamp = data.timestamp;
      _results = [];
      for (_i = 0, _len = watchers.length; _i < _len; _i++) {
        watcher = watchers[_i];
        if (watcher.hasOwnProperty("server") && watcher.server.hasOwnProperty(action) && watcher.id === data.id) {
          server.watcher = watcher;
          server.path = path;
          server.action = action;
          server.timestamp = timestamp;
          try {
            _results.push(!!server[action](data));
          } catch (error) {
            _results.push(console.log(error.stack));
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Watcher.broadcast = function(action, data, callback) {
      var params, replacer, self;
      if (data.action === "initialize") {
        if (callback) callback.call(self, null, null);
        return;
      }
      self = this;
      replacer = this.replacer;
      params = {
        url: "" + this.url + "/design.io/" + action,
        method: "POST",
        body: JSON.stringify(data, replacer),
        headers: {
          "Content-Type": "application/json"
        }
      };
      return request(params, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          if (callback) callback.call(self, null, response);
          return true;
        } else {
          error = error ? error.stack : response.body;
          if (callback) {
            return callback.call(self, error, null);
          } else {
            return console.log(error);
          }
        }
      });
    };

    function Watcher() {
      var arg, args, key, methods, value, _i, _len;
      args = Array.prototype.slice.call(arguments, 0, arguments.length);
      methods = args.pop();
      if (typeof methods === "function") methods = methods.call(this);
      if (args[0] instanceof Array) args = args[0];
      this.ignore = null;
      this.patterns = [];
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        this.patterns.push(typeof arg === "string" ? new RegExp(arg) : arg);
      }
      for (key in methods) {
        value = methods[key];
        this[key] = value;
      }
      this.id || (this.id = uuid());
      if (this.hasOwnProperty("server")) this.server.watcher = this;
    }

    Watcher.prototype.initialize = function(path, callback) {
      return callback();
    };

    Watcher.prototype.create = function(path, callback) {
      return this.update(path, callback);
    };

    Watcher.prototype.update = function(path, callback) {
      var self;
      self = this;
      return fs.readFile(path, 'utf-8', function(error, result) {
        if (error) return self.error(error);
        return self.broadcast({
          body: result
        }, callback);
      });
    };

    Watcher.prototype.destroy = function(path, callback) {
      return this.broadcast(callback);
    };

    Watcher.prototype.updateAll = function() {
      return Watcher.update();
    };

    Watcher.prototype.error = function(error, callback) {
      require('util').puts(error.stack);
      if (callback) callback();
      return false;
    };

    Watcher.prototype.match = function(path) {
      var pattern, patterns, _i, _len;
      if (this.ignore && !!this.ignore.exec(path)) return false;
      patterns = this.patterns;
      for (_i = 0, _len = patterns.length; _i < _len; _i++) {
        pattern = patterns[_i];
        if (!!pattern.exec(path)) return true;
      }
      return false;
    };

    Watcher.prototype.broadcast = function() {
      var action, args, callback, data;
      args = Array.prototype.slice.call(arguments, 0, arguments.length);
      callback = args.pop();
      if (typeof callback === "function") {
        data = args.pop() || {};
      } else {
        data = callback;
        callback = null;
      }
      data.action || (data.action = this.action);
      data.path || (data.path = this.path);
      data.id = this.id;
      action = args.shift() || "exec";
      return this.constructor.broadcast(action, data, callback);
    };

    Watcher.prototype.toJSON = function() {
      var client, data, key, value;
      data = {
        patterns: this.patterns,
        match: this.match,
        id: this.id
      };
      if (this.hasOwnProperty("client")) {
        client = this.client;
        for (key in client) {
          value = client[key];
          data[key] = value;
        }
      }
      return data;
    };

    Watcher.Watchfile = (function() {

      function Watchfile() {
        Watcher._store = void 0;
      }

      Watchfile.prototype.ignorePaths = function() {
        Watcher.ignoredPaths || (Watcher.ignoredPaths = []);
        return Watcher.ignoredPaths = Watcher.ignoredPaths.concat(Array.prototype.slice.call(arguments, 0, arguments.length));
      };

      Watchfile.prototype.watch = function() {
        return Watcher.create.apply(Watcher, arguments);
      };

      return Watchfile;

    })();

    return Watcher;

  })();

  module.exports = Watcher;

}).call(this);
