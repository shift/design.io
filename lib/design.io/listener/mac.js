(function() {
  var Mac, fs;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  fs = require('fs');
  Mac = (function() {
    __extends(Mac, require('../listener'));
    function Mac() {
      Mac.__super__.constructor.apply(this, arguments);
    }
    Mac.prototype.listen = function(callback) {
      var command, exec, self, spawn, _ref;
      Mac.__super__.listen.call(this, callback);
      self = this;
      _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;
      command = spawn('ruby', ["" + __dirname + "/mac.rb"]);
      command.stdout.setEncoding('utf8');
      command.stdout.on('data', function(data) {
        return self.changed(data, callback);
      });
      command.stdout.setEncoding('utf8');
      command.stderr.on('data', function(data) {
        return require('../../design.io').logger.error(data.toString().trim());
      });
      command.stdin.write(this.root);
      return command.stdin.end();
    };
    return Mac;
  })();
  module.exports = Mac;
}).call(this);
