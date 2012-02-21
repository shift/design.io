#!/usr/bin/env node

command   = require(__dirname)(process.argv)
Hook      = require("hook.io").Hook
io        = require('socket.io')
express   = require("express")
connect   = require('connect')
app       = express.createServer()
io        = require('socket.io').listen(app)
Project   = require("../project")
io.set 'log level', 1

io.on "connection", (socket) ->
  socket.on "userAgent", (data) ->
    socket.room = data.namespace
    socket.join(data.namespace)
    socket.set "userAgent", data, ->
      socket.emit "ready"
      Project.find(data.namespace).connect()
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

hook      = new Hook(name: "design.io-server", debug: false, silent: true, m: false)

hook.on "hook::ready", (data) ->
  _console.info "Design.io started on port #{command.port}"

hook.on "*::exec", (data, callback, event) ->
  return unless event.name.match("design.io-watcher")
  # updated, new Date, /Users/..., cwd, "my-project"
  # {action, timestamp, previous, current, path, namespace} = data
  # emit to browser
  io.sockets.in(data.namespace).emit data.action, JSON.stringify(data)

hook.start()

app.get "design.io", (request, response) ->
