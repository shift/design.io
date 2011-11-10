(function() {
  var Shift, Watcher, fs, path, request;
  fs = require('fs');
  path = require('path');
  Shift = require('shift');
  request = require('request');
  Watcher = (function() {
    Watcher.initialize = function(options) {
      if (options == null) {
        options = {};
      }
      this.directory = options.directory;
      this.watchfile = options.watchfile;
      this.port = options.port;
      this.url = options.url;
      if (!this.watchfile) {
        throw new Error("You must specify the watchfile");
      }
      if (!this.directory) {
        throw new Error("You must specify the directory to watch");
      }
      this.read(function() {
        return require('watch-node')(this.directory, function(path, prev, curr, action, timestamp) {
          return Watcher.exec(path, action);
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
          context = "        function() {          var watch       = this.watch;          var ignorePaths = this.ignorePaths;          global.Watcher  = require('./watcher');          " + result + "          delete global.Watcher        }        ";
          eval("(" + context + ")").call(new Watcher.DSL);
          if (callback) {
            return callback.call(this);
          }
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
    Watcher.exec = function(path, action, timestamp) {
      var success, watcher, watchers, _i, _len, _results;
      watchers = this.all();
      _results = [];
      for (_i = 0, _len = watchers.length; _i < _len; _i++) {
        watcher = watchers[_i];
        if (watcher.match(path)) {
          watcher.path = path;
          watcher.action = action;
          watcher.timestamp = timestamp;
          success = !!watcher[action](path);
          delete watcher.path;
          delete watcher.action;
          delete watcher.timestamp;
          if (!success) {
            break;
          }
        }
      }
      return _results;
    };
    Watcher.broadcast = function(action, data) {
      var params;
      params = {
        url: "" + this.url + "/design.io/" + action,
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      };
      return request(params, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          return true;
        } else {
          return console.log(error);
        }
      });
    };
    function Watcher() {
      var arg, args, key, methods, value, _i, _len;
      args = Array.prototype.slice.call(arguments, 0, arguments.length);
      methods = args.pop();
      if (typeof methods === "function") {
        methods = methods.call(this);
      }
      if (args[0] instanceof Array) {
        args = args[0];
      }
      this.patterns = [];
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        this.patterns.push(typeof arg === "string" ? new RegExp(arg) : arg);
      }
      for (key in methods) {
        value = methods[key];
        this[key] = value;
      }
    }
    Watcher.prototype.create = function(path) {
      return this.update(path);
    };
    Watcher.prototype.update = function(path) {
      var self;
      self = this;
      return fs.readFile(path, 'utf-8', function(error, result) {
        if (error) {
          return self.error(error);
        }
        return self.broadcast({
          body: result
        });
      });
    };
    Watcher.prototype["delete"] = function() {
      return this.broadcast();
    };
    Watcher.prototype.error = function(error) {
      console.log(error);
      return false;
    };
    Watcher.prototype.toId = function(path) {
      return path.replace(process.cwd() + '/', '').replace(/[\/\.]/g, '-');
    };
    Watcher.prototype.match = function(path) {
      var pattern, patterns, _i, _len;
      patterns = this.patterns;
      for (_i = 0, _len = patterns.length; _i < _len; _i++) {
        pattern = patterns[_i];
        if (!!pattern.exec(path)) {
          return true;
        }
      }
      return false;
    };
    Watcher.prototype.broadcast = function() {
      var action, args, data;
      args = Array.prototype.slice.call(arguments, 0, arguments.length);
      data = args.pop() || {};
      data.action || (data.action = this.action);
      data.path || (data.path = this.path);
      data.id || (data.id = this.toId(data.path));
      action = args.shift() || "exec";
      return this.constructor.broadcast(action, data);
    };
    Watcher.prototype.toJSON = function() {
      var action, actions, client, data, options, pattern, _i, _j, _len, _len2, _ref;
      data = {
        patterns: []
      };
      _ref = this.patterns;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pattern = _ref[_i];
        options = [];
        if (pattern.multiline) {
          options.push("m");
        }
        if (pattern.ignoreCase) {
          options.push("i");
        }
        if (pattern.global) {
          options.push("g");
        }
        data.patterns.push({
          source: pattern.source,
          options: options.join("")
        });
      }
      data.match = "(" + (this.match.toString()) + ")";
      if (this.hasOwnProperty("client")) {
        actions = ["create", "update", "delete"];
        client = this.client;
        for (_j = 0, _len2 = actions.length; _j < _len2; _j++) {
          action = actions[_j];
          if (client.hasOwnProperty(action)) {
            data[action] = "(" + (client[action].toString()) + ")";
          }
        }
      }
      return data;
    };
    Watcher.DSL = (function() {
      function DSL() {
        Watcher._store = void 0;
      }
      DSL.prototype.ignorePaths = function() {
        var args;
        return args = Array.prototype.slice.call(arguments, 0, arguments.length);
      };
      DSL.prototype.watch = function() {
        return Watcher.create.apply(Watcher, arguments);
      };
      DSL.prototype.watcher = function(name, options) {
        if (options == null) {
          options = {};
        }
        return require("design.io-" + name)(options);
      };
      return DSL;
    })();
    return Watcher;
  })();
  module.exports = Watcher;
}).call(this);
