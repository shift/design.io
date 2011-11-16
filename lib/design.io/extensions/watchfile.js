
  module.exports = function() {
    return Watcher.create(Watcher.watchfile, {
      update: function() {
        return Watcher.update();
      },
      destroy: function() {
        return Watcher.update();
      }
    });
  };
