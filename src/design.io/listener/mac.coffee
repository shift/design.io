fs              = require 'fs'
# https://github.com/thibaudgg/rb-fsevent

class Mac extends (require('../listener'))
  listen: (callback) ->
    super(callback)
    
    self = @
    
    {spawn, exec}   = require 'child_process'
    command   = spawn 'ruby', ["#{__dirname}/mac.rb"]
    command.stdout.setEncoding('utf8')
    command.stdout.on 'data', (data) -> 
      # console.log(data.toString().trim())
      self.changed(data, callback)
    command.stdout.setEncoding('utf8')
    command.stderr.on 'data', (data) -> 
      require('../../design.io').logger.error data.toString().trim()
    command.stdin.write @root
    command.stdin.end()
  #listen: (callback) ->
  # FSEvents        = require("fsevents")
  #  self        = @
  #  global.fse  = new FSEvents(@root)
  #  
  #  fse.on "change", (path, flags, evtid) ->
  #    self.changed(path)
  #    
  #    if fs.statSync("stop")
  #      console.log "Stop"
  #      fs.unlinkSync "stop"
  #      fse.stop()

module.exports = Mac