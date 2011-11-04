io        = require('socket.io')
connect   = require('connect')
express   = require('express')

app       = express.createServer()
io        = io.listen(app)
designer  = null

app.listen(process.env.PORT || 4181)

app.use connect.bodyParser()

app.post '/', (request, response) ->
  broadcast "update", request.body
  response.send 'updated'

broadcast = (name, data) ->
  io.sockets.socket(designer).emit(name, data)

io.sockets.on 'connection', (socket) ->
  socket.on 'userAgent', (data) ->
    socket.set 'userAgent', data, ->
      designer = socket.id
      socket.emit('ready')
      true
  
  socket.on 'disconnect', ->
    socket.emit 'user disconnected'