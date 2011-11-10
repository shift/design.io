window.DesignIO = (function() {
  function DesignIO(options) {
    options || (options = {});
    this.callbacks = {};
    this.stylesheets = {};
    this.javascripts = {};
    this.watchers = [];
    this.port = options.port || 4181;
    this.url = options.url || ("" + window.location.protocol + "://" + window.location.hostname + ":" + this.port);
    this.socket = io.connect(this.url);
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
      return socket.on('exec', function(data) {
        return self.exec(data);
      });
    });
  };
  DesignIO.prototype.on = function(name, callback) {
    return this.callbacks[name] = callback;
  };
  DesignIO.prototype.runCallback = function(name, data) {
    if (this.callbacks[name]) {
      this.callbacks[name].call(this, data);
    }
    return true;
  };
  DesignIO.prototype.watch = function(data) {
    var action, actions, i, pattern, watcher, watchers, _i, _j, _len, _len2, _len3, _ref;
    watchers = data.body;
    actions = ["create", "update", "delete"];
    for (_i = 0, _len = watchers.length; _i < _len; _i++) {
      watcher = watchers[_i];
      watcher.match = eval(watcher.match);
      for (_j = 0, _len2 = actions.length; _j < _len2; _j++) {
        action = actions[_j];
        if (watcher.hasOwnProperty(action)) {
          watcher[action] = eval(watcher[action]);
        }
      }
      _ref = watcher.patterns;
      for (i = 0, _len3 = _ref.length; i < _len3; i++) {
        pattern = _ref[i];
        watcher.patterns[i] = new RegExp(pattern.source, pattern.options);
      }
    }
    return this.watchers = watchers;
  };
  DesignIO.prototype.exec = function(data) {
    var watcher, watchers, _i, _len;
    watchers = this.watchers;
    for (_i = 0, _len = watchers.length; _i < _len; _i++) {
      watcher = watchers[_i];
      if (watcher.match(data.path)) {
        if (watcher.hasOwnProperty(data.action)) {
          watcher[data.action].call(this, data);
        }
      }
    }
    return this.runCallback(data.action, data);
  };
  DesignIO.prototype.log = function(data) {
    if (typeof data === "object") {
      data.userAgent = window.navigator.userAgent;
      data.url = window.location.href;
    }
    return this.socket.emit('log', data);
  };
  DesignIO.prototype.userAgent = function() {
    return {
      userAgent: window.navigator.userAgent,
      url: window.location.href
    };
  };
  return DesignIO;
})();