io        = require('socket.io')
connect   = require('connect')
express   = require('express')
command   = new (require("./command"))(process.argv)
Watcher   = require("./watcher")

Watcher.initialize watchfile: command.program.watchfile, directory: command.program.directory, port: command.program.port

app       = express.createServer()
io        = io.listen(app)
io.set 'log level', 1
designer  = null

app.listen(process.env.PORT || 4181)

app.use connect.bodyParser()

app.post '/:event', (req, res) ->
  broadcast req.params.event, req.body
  res.send req.params.event

testSocket  = null
agents      = {}

broadcast = (name, data) ->
  #io.sockets.socket(testSocket).emit(name, data)
  io.sockets.emit name, data

io.sockets.on 'connection', (socket) ->
  socket.on 'userAgent', (data) ->
    socket.set 'userAgent', data, ->
      agents[socket.id] = data
      testSocket        = socket.id
      socket.emit 'ready'
      Watcher.connect()
      true
  
  socket.on 'log', (msg) ->
    # msg.userAgent     = agents[socket.id]
    io.sockets.socket(testSocket).emit("spec", msg) if testSocket?
    socket.emit("spec", msg)
    true
  
  socket.on 'disconnect', ->
    socket.emit 'user disconnected'