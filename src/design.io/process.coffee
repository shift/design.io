global._console ||= require('underscore.logger')

command = new (require("#{__dirname}/command"))(process.argv)

if command.program.command == "start"
  forever = require("forever")
  server = forever.start([
      "node",
      "#{__dirname}/server.js", 
      "--watchfile", command.program.watchfile, 
      "--directory", command.program.directory, 
      "--port", command.program.port
    ], {max: 1, silent: true, killTree: true})

  server.on "stdout", (data) ->
    console.log data.toString().trim()
  server.on "error", (error) ->
    console.log error
  server.on "exit", ->
    console.log "EXIT"
  server.on "start", (process, data) ->
    @
  server.on "stderr", (data) ->
    _console.error data.toString().trim()
  
  forever.startServer(server)
else
  command.run()