(function() {
  window.DesignIO = (function() {
    function DesignIO(options) {
      options || (options = {});
      this.port = options.port || 4181;
      this.url = options.url || ("http://localhost:" + this.port);
      this.socket = io.connect(this.url);
      this.callbacks = {};
      this.stylesheets = {};
      this.javascripts = {};
      this.watchers = [];
      this.connect();
    }
    DesignIO.prototype.connect = function() {
      var self, socket;
      socket = this.socket;
      self = this;
      return socket.on('connect', function() {
        socket.emit('userAgent', self.userAgent());
        socket.on('watch', function(data) {
          return self.watch(data);
        });
        return socket.on('change', function(data) {
          return self.change(data);
        });
      });
    };
    DesignIO.prototype.on = function(name, callback) {
      return this.callbacks[name] = callback;
    };
    DesignIO.prototype.runCallback = function(name, data) {
      if (this.callbacks[name]) {
        this.callbacks[name](data);
      }
      return true;
    };
    DesignIO.prototype.watch = function(data) {
      var action, actions, pattern, patterns, watcher, _i, _j, _len, _len2, _ref;
      watcher = {};
      actions = ["create", "update", "delete"];
      for (_i = 0, _len = actions.length; _i < _len; _i++) {
        action = actions[_i];
        if (data.hasOwnProperty(action)) {
          watcher[action] = eval("(" + data[action] + ")");
        }
      }
      patterns = [];
      _ref = data.patterns;
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        pattern = _ref[_j];
        patterns.push(new RegExp(pattern.pattern, pattern.options));
      }
      watcher.patterns = patterns;
      watcher.match = function(path) {
        var pattern, _k, _len3, _ref2;
        _ref2 = this.patterns;
        for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
          pattern = _ref2[_k];
          if (pattern.exec(path)) {
            return true;
          }
        }
        return false;
      };
      this.watchers.push(watcher);
      return this.runCallback("watch", data);
    };
    DesignIO.prototype.change = function(data) {
      var watcher, watchers, _i, _len;
      watchers = this.watchers;
      for (_i = 0, _len = watchers.length; _i < _len; _i++) {
        watcher = watchers[_i];
        if (watcher.match(data.path)) {
          if (watcher.hasOwnProperty(data.action)) {
            watcher[data.action].call(window, data);
          }
        }
      }
      return this.runCallback("change", data);
    };
    DesignIO.prototype.userAgent = function() {
      return {
        userAgent: window.navigator.userAgent,
        url: window.location.href
      };
    };
    return DesignIO;
  })();
}).call(this);
