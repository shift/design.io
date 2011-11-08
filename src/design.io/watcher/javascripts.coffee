Shift = require 'shift'
_path = require 'path'
fs    = require 'fs'

# ignorePaths "./tmp"

# watcher "assets", ->
#   watch ".styl"

module.exports = (options = {}) ->
  patterns  = options.patterns || [/\.(coffee|ejs|js)$/]
  
  if options.hasOwnProperty("compress") && options.compress == true
    compressor = new Shift.UglifyJS
  
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
      
    delete: (path) ->
      @broadcast id: @toId(path), path: path
    
    client:
      update: (data) ->
        javascripts = @javascripts ||= {}
        javascripts[data.id].remove() if javascripts[data.id]?
        node = $("<script id='#{data.id}' type='text/javascript'>#{data.body}</script>")
        javascripts[data.id] = node
        $("body").append(node)
      
      destroy: (data) ->
        javascripts[data.id].remove() if javascripts[data.id]?
        
    server: {}