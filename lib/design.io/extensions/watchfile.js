
  module.exports = function() {
    return Watcher.create(Watcher.watchfile, {
      update: function() {
        return Watcher.update();
      },
      "delete": function() {
        return Watcher.update();
      }
    });
  };
