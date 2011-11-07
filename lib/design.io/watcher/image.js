(function() {
  module.exports = function(options) {
    return watch(".png", ".jpg", function() {
      this.server(function(path) {
        return this.emit({
          path: path,
          data: transform(path)
        });
      });
      return this.client(function(data) {
        return $("#" + data.id).attr("src", data.url);
      });
    });
  };
}).call(this);
