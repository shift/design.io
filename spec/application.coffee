io      = require('socket.io')
express = require("express")
connect = require('connect')
_       = require("underscore")._
Watcher = require("../lib/design.io/watcher")

Watcher.initialize watchfile: "Watchfile", directory: process.cwd(), port: 4181

app     = express.createServer()

io      = io.listen(app)
io.set 'log level', 1
coffee  = require('coffee-script')

app.listen(4181)

jade    = require("jade")

# Setup configuration
app.use express.static(__dirname + '/..')
app.use connect.bodyParser()
app.set 'view engine', 'jade'
app.set 'views', __dirname + '/views'

app.get '/', (req, res) ->
  res.render 'index.jade',
    title:    'Spec Runner'
    address:  app.settings.address
    port:     app.settings.port
    pretty:   true

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