(function() {
  var Windows,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Windows = (function(_super) {

    __extends(Windows, _super);

    function Windows() {
      Windows.__super__.constructor.apply(this, arguments);
    }

    return Windows;

  })(require('../listener'));

  module.exports = Windows;

}).call(this);
