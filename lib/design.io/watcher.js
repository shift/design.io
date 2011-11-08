(function() {
  var Shift, Watcher, fs, path, request;
  fs = require('fs');
  path = require('path');
  Shift = require('shift');
  request = require('request');
  Watcher = (function() {
    Watcher.initialize = function(options) {
      var directory, watchfile;
      if (options == null) {
        options = {};
      }
      this.watchfile = watchfile = options.watchfile;
      this.directory = directory = options.directory;
      this.port = options.port;
      if (!this.watchfile) {
        throw new Error("You must specify the watchfile");
      }
      if (!this.directory) {
        throw new Error("You must specify the directory to watch");
      }
      return fs.readFile(watchfile, "utf-8", function(error, result) {
        var engine;
        engine = new Shift.CoffeeScript;
        return engine.render(result, function(error, result) {
          var context;
          context = "        function() {          var watch       = this.watch;          var ignorePaths = this.ignorePaths;          global.Watcher  = require('./watcher');          " + result + "          delete global.Watcher        }        ";
          eval("(" + context + ")").call(new Watcher.DSL);
          return require('watch-node')(directory, function(path, prev, curr, action, timestamp) {
            return Watcher.exec(path, action);
          });
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
    Watcher.exec = function(path, action, timestamp) {
      var watcher, watchers, _i, _len, _results;
      watchers = this.all();
      _results = [];
      for (_i = 0, _len = watchers.length; _i < _len; _i++) {
        watcher = watchers[_i];
        if (watcher.match(path)) {
          watcher.action = action;
          console.log(watcher.patterns);
          if (!watcher[action](path)) {
            break;
          }
        }
      }
      return _results;
    };
    Watcher.connect = function() {
      var watcher, watchers, _i, _len, _results;
      watchers = this.all();
      _results = [];
      for (_i = 0, _len = watchers.length; _i < _len; _i++) {
        watcher = watchers[_i];
        _results.push(watcher.connect());
      }
      return _results;
    };
    Watcher.prototype.create = function() {
      return this.update.apply(this, arguments);
    };
    Watcher.prototype.update = function() {};
    Watcher.prototype["delete"] = function() {};
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
      var args, data, event, params;
      args = Array.prototype.slice.call(arguments, 0, arguments.length);
      data = args.pop();
      event = args.shift() || "change";
      data.action = this.action;
      params = {
        url: "http://localhost:" + Watcher.port + "/" + event,
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
    Watcher.prototype.connect = function() {
      var action, actions, data, options, pattern, _i, _j, _len, _len2, _ref;
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
          pattern: pattern.source,
          options: options.join("")
        });
      }
      if (this.hasOwnProperty("client")) {
        actions = ["create", "update", "delete"];
        for (_j = 0, _len2 = actions.length; _j < _len2; _j++) {
          action = actions[_j];
          if (this.client.hasOwnProperty(action)) {
            data[action] = this.client[action].toString();
          }
        }
      }
      return this.broadcast("watch", data);
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
    Watcher.DSL = (function() {
      function DSL() {}
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
