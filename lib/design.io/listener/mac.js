(function() {
  var Mac, exec, spawn, _ref;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;

  Mac = (function() {

    __extends(Mac, require('../listener'));

    function Mac(pathfinder, callback) {
      var command, self;
      Mac.__super__.constructor.call(this, pathfinder);
      self = this;
      command = spawn('ruby', ["" + __dirname + "/mac.rb"]);
      command.stdout.setEncoding('utf8');
      command.stdout.on('data', function(data) {
        return self.changed(data, callback);
      });
      command.stdout.setEncoding('utf8');
      command.stderr.on('data', function(data) {
        return _console.error(data.toString().trim());
      });
      command.stdin.write(this.root);
      command.stdin.end();
    }

    return Mac;

  })();

  module.exports = Mac;

}).call(this);
