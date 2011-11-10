exec = require('child_process').exec

module.exports = ->
  args    = Array.prototype.slice.call(arguments, 0, arguments.length)
  options = if typeof args[args.length - 1] == "object" then args.pop() else {}
  args[0] = /.*/ unless args.length > 0
  
  unless options.server
    throw new Error("You must specify the restart command: require('design.io/reload')(command: 'node app.js')")
    
  command = options.command
  
  Watcher.create args,
    update: (path) ->
      exec 'ps aux | grep node', (e, stdout, o) ->
        lines = stdout.toString().split("\n")
        for line in lines
          if line.match(server)
            match = line.match(/[^ ]+ +(\d+)/)
            if match
              pid = match[1]
              exec "kill -2 #{pid}"
              exec command
              console.log "Server restarted... #{command}"
