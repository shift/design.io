(function() {
  module.exports = {
    watcher: require('./design.io/watcher'),
    command: require('./design.io/command'),
    connection: require('./design.io/connection'),
    logger: new (require("common-logger"))({
      colorized: true
    }),
    extension: function(name) {
      return require("./design.io/extensions/" + name).apply(this, Array.prototype.slice.call(arguments, 1, arguments.length));
    }
  };
}).call(this);
