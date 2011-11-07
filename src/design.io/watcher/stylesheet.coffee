Shift = require 'shift'
_path = require 'path'
fs    = require 'fs'

# ignorePaths "./tmp"

# watcher "assets", ->
#   watch ".styl"

module.exports = (options) ->
  Watcher = require("#{process.cwd()}/lib/design.io/watcher")
  Watcher.create options.extensions,
    create: (path) ->
      @update(path)
    
    update: (path) ->
      self = @
    
      fs.readFile path, 'utf-8', (error, result) ->
        engine = Shift.engine(_path.extname(path))
        
        if engine
          engine.render result, (error, result) ->
            return self.error(error) if error
            self.broadcast path: path, body: result, id: self.toId(path)
        else
          self.broadcast path: path, body: result, id: self.toId(path)
        
    delete: (path) ->
      @broadcast id: @id(path)
    
    client:
      update: (data) ->
        stylesheets = @stylesheets ||= {}
        stylesheets[data.id].remove() if stylesheets[data.id]?
        node = $("<style id='#{data.id}' type='text/css'>#{data.body}</style>")
        stylesheets[data.id] = node
        $("body").append(node)
      
      destroy: (data) ->
        $("##{data.id}").remove()
        
    server: {}