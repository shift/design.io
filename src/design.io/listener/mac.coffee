{spawn, exec}   = require 'child_process'
# https://github.com/thibaudgg/rb-fsevent

class Mac extends (require('../listener'))
  constructor: (pathfinder, callback) ->
    super(pathfinder, callback)
    
    self = @
    
    command   = spawn 'ruby', ["#{__dirname}/mac.rb"]
    command.stdout.setEncoding('utf8')
    command.stdout.on 'data', (data) -> 
      data = JSON.parse("[" + data.replace(/\]\[/g, ",").replace(/[\[\]]/g, "") + "]")
      # console.log(data.toString().trim())
      for path in data
        self.changed(path[0..-2], callback)
    command.stdout.setEncoding('utf8')
    command.stderr.on 'data', (data) -> 
      _console.error data.toString().trim()
    command.stdin.write @root
    command.stdin.end()
    
module.exports = Mac
