(function() {
  module.exports = function(options) {
    return this.watch(options.extensions({
      create: function(path) {
        return this.update(path);
      },
      update: function(path) {
        return Shift.renderFile(path, function(error, result) {
          if (error) {
            return this.error(error);
          }
          return this.emit({
            path: path,
            body: result,
            id: this.id(path)
          });
        });
      },
      "delete": function(path) {
        return this.emit({
          id: this.id(path)
        });
      },
      render: {
        update: function(data) {
          var node, stylesheets;
          stylesheets = this.stylesheets || (this.stylesheets = {});
          if (stylesheets[data.id] != null) {
            stylesheets[data.id].remove();
          }
          node = $("<style id='" + data.id + "' type='text/css'>" + data.body + "</style>");
          stylesheets[data.id] = node;
          return $("body").append(node);
        },
        destroy: function(data) {
          return $("#" + data.id).remove();
        }
      }
    }));
  };
}).call(this);
