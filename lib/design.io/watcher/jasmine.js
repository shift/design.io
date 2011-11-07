(function() {
  module.exports = function(options) {
    return watch(options.patterns, function() {
      return {
        render: function() {
          return {
            update: function() {
              var webSocketReporter;
              this.jasmineEnv = window.jasmine.getEnv();
              this.jasmineEnv.updateInterval = 1000;
              webSocketReporter = new window.jasmine.WebSocketReporter(this);
              this.jasmineEnv.addReporter(webSocketReporter);
              this.jasmineEnv.specFilter = function(spec) {
                return webSocketReporter.specFilter(spec);
              };
              return this.jasmineEnv.execute();
            }
          };
        }
      };
    });
  };
}).call(this);
