(function() {
  module.exports = {
    watcher: require('./design.io/watcher'),
    command: require('./design.io/command'),
    connection: require('./design.io/connection'),
    plugin: function(name) {
      return require("./design.io/plugins/" + name).apply(this, Array.prototype.slice.call(arguments, 1, arguments.length));
    }
  };
}).call(this);
