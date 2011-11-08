Shift = require 'shift'
_path = require 'path'
fs    = require 'fs'

# ignorePaths "./tmp"

# watcher "assets", ->
#   watch ".styl"

module.exports = (options = {}) ->
  patterns = options.patterns || [/\.(styl|less|css|sass|scss)$/]
  
  if options.hasOwnProperty("compress") && options.compress == true
    compressor = new Shift.YuiCompressor
  
  Watcher.create patterns,
    create: (path) ->
      @update(path)
    
    update: (path) ->
      self = @
      
      fs.readFile path, 'utf-8', (error, result) ->
        engine = Shift.engine(_path.extname(path))
        
        if engine
          engine.render result, (error, result) ->
            return self.error(error) if error
            if compressor
              compressor.render result, (error, result) ->
                return self.error(error) if error
                self.broadcast id: self.toId(path), path: path, body: result
            else
              self.broadcast id: self.toId(path), path: path, body: result
        else
          if compressor
            compressor.render result, (error, result) ->
              return self.error(error) if error
              self.broadcast path: path, body: result, id: self.toId(path)
          self.broadcast id: self.toId(path), path: path, body: result
      true
        
    delete: (path) ->
      @broadcast id: @toId(path), path: path
    
    client:
      # this should get better so it knows how to map template files to browser files
      update: (data) ->
        stylesheets = @stylesheets ||= {}
        stylesheets[data.id].remove() if stylesheets[data.id]?
        node = $("<style id='#{data.id}' type='text/css'>#{data.body}</style>")
        stylesheets[data.id] = node
        $("body").append(node)
      
      delete: (data) ->
        stylesheets[data.id].remove() if stylesheets[data.id]?
        
    server: {}