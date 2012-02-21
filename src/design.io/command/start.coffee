#!/usr/bin/env node

command   = require(__dirname)(process.argv)
Hook      = require("hook.io").Hook
io        = require('socket.io')
express   = require("express")
connect   = require('connect')
app       = express.createServer()
io        = require('socket.io').listen(app)
designer  = io.of("/design.io")
Project   = require("../project")
# io.set 'log level', 1

designer.on "connection", (socket) ->
  socket.on "userAgent", (data) ->
    socket.set "userAgent", data, ->
      socket.emit "ready"
      Project.find(data.namespace).connect()
      true
  
  socket.on "log", (data) ->
    Project.find(data.namespace).log(data)
    true
  
  socket.on "disconnect", ->
    socket.emit "user disconnected"
    
app.listen(command.port)
app.use express.static(__dirname + '/../..')
app.use connect.bodyParser()

hook      = new Hook(name: "design.io-server", debug: true)

hook.on "hook::ready", (data) ->
  console.log "hook started"

hook.on "design.io-watcher::initialized", (data) ->
  # updated, new Date, /Users/..., cwd, "my-project"
  {action, paths, namespace} = data
  # emit to browser
  designer.broadcast action, JSON.stringify(data)
  
hook.on "design.io-watcher::changed", (data) ->
  console.log "design.io-watcher!!!"
  console.log data
  # updated, new Date, /Users/..., cwd, "my-project"
  {action, timestamp, previous, current, path, namespace} = data
  # emit to browser
  designer.broadcast action, JSON.stringify(data)

hook.start()

app.get "design.io", (request, response) ->  

_console.info "Design.io started on port #{command.port}"