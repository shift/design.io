Shift = require 'shift'
_path = require 'path'
fs    = require 'fs'

module.exports = ->
  args    = Array.prototype.slice.call(arguments, 0, arguments.length)
  options = if typeof args[args.length - 1] == "object" then args.pop() else {}
  args[0] = /\.(jade|mustache|haml|erb|coffee)$/ unless args.length > 0
  
  Watcher.create args,
    update: (path) ->
      self = @
      
      fs.readFile path, 'utf-8', (error, result) ->
        Shift.render path: path, string: result, (error, output) ->
          return self.error(error) if error
          self.broadcast body: output
      
      true