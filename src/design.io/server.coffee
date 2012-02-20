command   = new (require("./command"))(process.argv)
#command.run()

io      = require('socket.io')
express = require("express")
connect = require('connect')
Watcher = require("../../lib/design.io/watcher")

app     = express.createServer()

# io      = io.listen(app)
coffee  = require('coffee-script')

designer  = require('../../lib/design.io/connection')(require('socket.io').listen(app))

app.listen(command.program.port)

# Setup configuration
app.use express.static(__dirname + '/../..')
app.use connect.bodyParser()

app.post '/design.io/:event', (request, response) ->
  designer.emit request.params.event, JSON.stringify(request.body)
  response.send request.params.event
  
app.get "design.io", (request, response) ->
  

_console.info "Design.io started on port #{command.program.port}"