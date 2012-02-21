(function() {
  var command, project;

  command = require(__dirname)(process.argv);

  project = new (require("../project"))(command);

  project.watch();

}).call(this);
