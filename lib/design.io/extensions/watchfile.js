
  module.exports = function() {
    return Watcher.create(require("../project").find().watchfile, {
      update: function() {
        return this.updateAll();
      },
      destroy: function() {
        return this.updateAll();
      }
    });
  };
