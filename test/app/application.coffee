io      = require('socket.io')
express = require("express")
connect = require('connect')
Watcher = require("../../lib/design.io/watcher")

#Watcher.initialize watchfile: "Watchfile", directory: process.cwd(), port: 4181, url: "http://localhost:4181"

app     = express.createServer()

# io      = io.listen(app)
coffee  = require('coffee-script')

designer  = require('../../lib/design.io/connection')(require('socket.io').listen(app))

app.listen(4181)

jade    = require("jade")

# Setup configuration
app.use express.static(__dirname + '/../..')
app.use connect.bodyParser()
app.set 'view engine', 'jade'
app.set 'views', __dirname + '/views'

app.get '/', (request, response) ->
  response.render 'index.jade',
    title:    'Spec Runner'
    address:  app.settings.address
    port:     app.settings.port
    pretty:   true

app.post '/design.io/:event', (request, response) ->
  broadcast request.params.event, JSON.stringify(request.body)
  response.send request.params.event

testSocket  = null
agents      = {}

broadcast = (name, data) ->
  designer.emit name, data
