global._console ||= require('underscore.logger')
forever = require("forever")

command = new (require("#{__dirname}/command"))(process.argv)
file    = "#{__dirname}/server.js"

switch command.program.command
  when "start"
    server  = forever.start([
        "node",
        file, 
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
  when "stop"
    forever.list false, (error, processes) ->
      for process, index in processes
        if process.file == file
          forever.stop(index)
          break
      
  else
    command.run()