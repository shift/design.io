{spawn, exec}  = require 'child_process'

command = new (require("#{__dirname}/design.io/command"))(process.argv)

server = spawn "node", ["#{__dirname}/design.io/server"]
server.stdout.on 'data', (data) -> console.log data.toString().trim()
server.stderr.on 'data', (data) -> console.log data.toString().trim()

#watcher = spawn "node", ["#{__dirname}/design.io/watcher", "--directory", program.directory, "--watch", program.watch]
#watcher.stdout.on 'data', (data) -> console.log data.toString().trim()
#watcher.stderr.on 'data', (data) -> console.log data.toString().trim()

command = new (require("#{__dirname}/design.io/command"))
Watcher.initialize watchfile: command.program.watchfile, directory: command.program.directory, port: command.program.port