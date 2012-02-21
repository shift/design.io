(function() {
  var command, forever;

  global._console || (global._console = require('underscore.logger'));

  forever = require("forever");

  command = new (require("" + __dirname + "/command"))(process.argv);

}).call(this);
