{spawn, exec}  = require 'child_process'

global._console ||= require('underscore.logger')

command = new (require("#{__dirname}/command"))(process.argv)
command.run()

server = spawn "node", [
  "#{__dirname}/server", 
  "--watchfile", command.program.watchfile, 
  "--directory", command.program.directory, 
  "--port", command.program.port
]
server.stdout.on 'data', (data) -> 
  # console.log data.toString().trim()
server.stderr.on 'data', (data) -> 
  console.log data.toString().trim()
