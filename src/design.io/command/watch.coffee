#!/usr/bin/env node
command   = require(__dirname)(process.argv)
project   = new (require("../project"))(command)
project.watch()