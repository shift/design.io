Shift = require 'shift'
_path = require 'path'
fs    = require 'fs'

module.exports = ->
  args    = Array.prototype.slice.call(arguments, 0, arguments.length)
  options = if typeof args[args.length - 1] == "object" then args.pop() else {}
  args[0] = /\.(coffee|ejs|js)$/ unless args.length > 0
  
  if options.hasOwnProperty("compress") && options.compress == true
    compressor = new Shift.UglifyJS
  
  Watcher.create args,
    update: (path) ->
      self = @
      
      fs.readFile path, 'utf-8', (error, result) ->
        Shift.render path: path, string: result, (error, output) ->
          return self.error(error) if error
          if compressor
            compressor.render output, (error, result) ->
              return self.error(error) if error
              self.broadcast body: result
          else
            self.broadcast body: output
    
    client:
      update: (data) ->
        $("<script id='#{data.id}' type='text/javascript'>#{data.body}</script>")
