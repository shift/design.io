#!/usr/bin/env node

command   = require(__dirname)(process.argv)
Hook      = require("hook.io").Hook
io        = require('socket.io')
express   = require("express")
connect   = require('connect')
app       = express.createServer()
io        = require('socket.io').listen(app)
Project   = require("../project")
io.set 'log level', 2

io.sockets.on "connection", (socket) ->
  socket.on "userAgent", (data) ->
    socket.room = data.namespace
    socket.join(data.namespace)
    socket.set "userAgent", data, ->
      hook.emit "connect", =>
      #Project.find(data.namespace).connect()
      true
  
  socket.on "log", (data) ->
    Project.find(data.namespace).log(data)
    true

  socket.on "disconnect", ->
    socket.emit "user disconnected"
    socket.leave(socket.room)
		
app.listen(command.port)
app.use express.static(__dirname + '/../..')
app.use connect.bodyParser()

hook      = new Hook(name: "design.io-server", debug: true, silent: false, m: false)

hook.on "hook::ready", (data, callback, event) ->
  _console.info "Design.io started on port #{command.port}"

hook.on "*::*::ready", (data, callback, event) ->
  #new Project(event.name.split("::")[1])

hook.on "*::*::watch", (data, callback, event) ->  
  return unless event.name.match("design.io-watcher")
  # updated, new Date, /Users/..., cwd, "my-project"
  # {action, timestamp, previous, current, path, namespace} = data
  # emit to browser
  object = JSON.parse(data)
  io.sockets.in(object.namespace).emit "watch", data
  
hook.on "*::*::exec", (data, callback, event) ->
  return unless event.name.match("design.io-watcher")
  # updated, new Date, /Users/..., cwd, "my-project"
  # {action, timestamp, previous, current, path, namespace} = data
  # emit to browser
  object = JSON.parse(data)
  io.sockets.in(object.namespace).emit "exec", data

hook.start()

app.get "/design.io", (request, response) ->
  response.write "Design.io Connected!"
