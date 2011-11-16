module.exports = (portOrIo) ->
  if typeof portOrIo == "object"
    io = portOrIo
  else
    io = require("socket.io").listen(portOrIo)
  
  Watcher   = require("./watcher")
  io.set 'log level', 1
  
  designer  = io.of("/design.io")
  
  designer.on "connection", (socket) ->
    socket.on "userAgent", (data) ->
      console.log data
      socket.set "userAgent", data, ->
        socket.emit "ready"
        Watcher.connect()
        true
    
    socket.on "log", (data) ->
      Watcher.log(data)
      true
    
    socket.on "disconnect", ->
      socket.emit "user disconnected"
      
  designer
