module.exports = (portOrIo) ->
  if typeof portOrIo == "object"
    io = portOrIo
  else
    io = require("socket.io").listen(port)
  
  Watcher   = require("./watcher")
  designer  = io.of("/design.io")
  
  designer.on "connection", (socket) ->
    socket.on "userAgent", (data) ->
      socket.set "userAgent", data, ->
        socket.emit "ready"
        Watcher.connect()
        true
    
    socket.on "log", (msg) ->
      console.log msg
      true
    
    socket.on "disconnect", ->
      socket.emit "user disconnected"
      
  designer
