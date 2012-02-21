(function() {

  #!/usr/bin/env node;

  var Hook, command, hook;

  command = require(__dirname)(process.argv);

  Hook = require("hook.io").Hook;

  hook = new Hook({
    name: "design.io-watcher",
    debug: true
  });

  hook.on("hook::ready", function(data) {
    return hook.emit("ready", data);
  });

  hook.on("design.io::change", function(data) {
    var action, date, path, root, slug;
    return action = data.action, date = data.date, path = data.path, root = data.root, slug = data.slug, data;
  });

  hook.start();

}).call(this);
