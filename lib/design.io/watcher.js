(function() {
  var Pathfinder, Shift, Watcher, fs, path, request, uuid;

  fs = require('fs');

  path = require('path');

  uuid = require('node-uuid');

  Shift = require('shift');

  request = require('request');

  Pathfinder = require('pathfinder');

  require('underscore.logger');

  Watcher = (function() {

    Watcher.initialize = function(options) {
      if (options == null) options = {};
      this.directory = options.directory;
      this.pathfinder = new Pathfinder(this.directory);
      this.watchfile = options.watchfile;
      this.port = options.port;
      this.url = options.url;
      if (!this.watchfile) throw new Error("You must specify the watchfile");
      if (!this.directory) {
        throw new Error("You must specify the directory to watch");
      }
      this.read(function() {
        return new (require('./listener/mac'))(Watcher.pathfinder.root, function(path, options) {
          return Watcher.changed(path, options);
        });
      });
      return this;
    };

    Watcher.read = function(callback) {
      var self;
      self = this;
      return fs.readFile(this.watchfile, "utf-8", function(error, result) {
        var engine;
        engine = new Shift.CoffeeScript;
        return engine.render(result, function(error, result) {
          var context;
          context = "        function() {          var watch       = this.watch;          var ignorePaths = this.ignorePaths;          var watcher     = this.watcher;          global.Watcher  = require('./watcher');          " + result + "          delete global.Watcher        }        ";
          eval("(" + context + ")").call(new Watcher.Watchfile);
          if (callback) return callback.call(self);
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
      if (typeof value === "function" || value instanceof RegExp) {
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

    Watcher.changed = function(path, options) {
      var action, timestamp, watcher, watchers, _i, _len, _results;
      if (options == null) options = {};
      watchers = this.all();
      action = options.action;
      timestamp = options.timestamp;
      _results = [];
      for (_i = 0, _len = watchers.length; _i < _len; _i++) {
        watcher = watchers[_i];
        if (watcher.match(path)) {
          watcher.path = path;
          watcher.action = action;
          watcher.timestamp = timestamp;
          try {
            _results.push(!!watcher[action](path, options));
          } catch (error) {
            _results.push(_console.error(error.toString()));
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
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
            _results.push(_console.error(error.toString()));
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Watcher.broadcast = function(action, data) {
      var params, replacer;
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
          return true;
        } else {
          if (error) {
            return _console.error(error.toString());
          } else {
            return _console.error(response.body);
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

    Watcher.prototype.create = function(path) {
      return this.update(path);
    };

    Watcher.prototype.update = function(path) {
      var self;
      self = this;
      return fs.readFile(path, 'utf-8', function(error, result) {
        if (error) return self.error(error);
        return self.broadcast({
          body: result
        });
      });
    };

    Watcher.prototype.destroy = function() {
      return this.broadcast();
    };

    Watcher.prototype.updateAll = function() {
      return Watcher.update();
    };

    Watcher.prototype.error = function(error) {
      _console.error(error.hasOwnProperty("message") ? error.message : error.toString());
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
      var action, args, data;
      args = Array.prototype.slice.call(arguments, 0, arguments.length);
      data = args.pop() || {};
      data.action || (data.action = this.action);
      data.path || (data.path = this.path);
      data.id = this.id;
      action = args.shift() || "exec";
      return this.constructor.broadcast(action, data);
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
        var args;
        return args = Array.prototype.slice.call(arguments, 0, arguments.length);
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
