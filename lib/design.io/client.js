
  window.DesignIO = (function() {

    function DesignIO(options) {
      options || (options = {});
      this.callbacks = {};
      this.stylesheets = {};
      this.javascripts = {};
      this.watchers = [];
      this.port = options.port || 4181;
      this.url = options.url || ("" + window.location.protocol + "//" + window.location.hostname + ":" + this.port + "/design.io");
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
          console.log(data);
          return self.watch(JSON.parse(data, self.reviver));
        });
        return socket.on('exec', function(data) {
          return self.exec(JSON.parse(data, self.reviver));
        });
      });
    };

    DesignIO.prototype.on = function(name, callback) {
      return this.callbacks[name] = callback;
    };

    DesignIO.prototype.runCallback = function(name, data) {
      if (this.callbacks[name]) this.callbacks[name].call(this, data);
      return true;
    };

    DesignIO.prototype.watch = function(data) {
      return this.watchers = data.body;
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
      return this.socket.emit('log', JSON.stringify(data, this.replacer));
    };

    DesignIO.prototype.userAgent = function() {
      return {
        userAgent: window.navigator.userAgent,
        url: window.location.href
      };
    };

    DesignIO.prototype.replacer = function(key, value) {
      if (typeof value === "function") {
        return "(" + value + ")";
      } else {
        return value;
      }
    };

    DesignIO.prototype.reviver = function(key, value) {
      if (typeof value === "string" && !!value.match(/^(?:\(function\s*\([^\)]*\)\s*\{|\(\/)/) && !!value.match(/(?:\}\s*\)|\/\w*\))$/)) {
        return eval(value);
      } else {
        return value;
      }
    };

    return DesignIO;

  })();
