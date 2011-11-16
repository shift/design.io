Shift = require 'shift'
_path = require 'path'
fs    = require 'fs'
Pathfinder  = require 'pathfinder'
File  = Pathfinder.File

# http://darcyclarke.me/development/detect-attribute-changes-with-jquery/
# https://github.com/jollytoad/jquery.mutation-events
# http://stackoverflow.com/questions/1029241/javascript-object-watch-for-all-browsers
# https://github.com/stubbornella/csslint
# 
# Example
# 
#     require('design.io-stylesheets') /\.(styl|less|sass|scss)$/
#       outputPath: (path) -> "./public/#{path}"
#       lookup:     File.directories(process.cwd())
#       compress:   false
#       write:      (path, string) -> # make your own!
#         File.write(@outputPath(path), string)
#         File.write(File.pathWithDigest(path), string)
#       
module.exports = ->
  pathfinder  = Watcher.pathfinder
  args        = Array.prototype.slice.call(arguments, 0, arguments.length)
  options     = if typeof args[args.length - 1] == "object" then args.pop() else {}
  args[0]     = /\.(coffee|js)$/ unless args.length > 0
  args[0]   ||= options.patterns if options.hasOwnProperty("patterns")
  
  outputPath  = options.outputPath
  writeMethod = options.write
  importPaths = options.paths || []
  debug       = options.hasOwnProperty("debug") && options.debug == true
  ignore      = options.ignore # for now it must be a regexp
  
  if options.hasOwnProperty("compress") && options.compress == true
    compressor = new Shift.UglifyJS
    
  write = (path, string) ->
    if writeMethod
      writeMethod.call(@, path, string)
    else if outputPath
      _outputPath = outputPath.call(@, path)
      if _outputPath
        File.write(_outputPath, string)
        
  touchDependencies = (file) ->
    dependentPaths = pathfinder.dependsOn(file.absolutePath())
    if dependentPaths && dependentPaths.length > 0
      for dependentPath in dependentPaths
        # touch the file so it loops back through
        File.touch dependentPath
  
  Watcher.create args,
    ignore: ignore
    
    toSlug: (path) ->
      path.replace(process.cwd() + '/', '').replace(/[\/\.]/g, '-')
      
    update: (path) ->
      self = @
      
      pathfinder.compile path, (error, string, file) ->
        return self.error(error) if error
        
        if compressor
          compressor.render string, (error, result) ->
            return self.error(error) if error
            self.broadcast body: result, slug: self.toSlug(path)
            write.call(self, path, result)
            touchDependencies(file)
        else
          self.broadcast body: string, slug: self.toSlug(path)
          write.call(self, path, string)
          touchDependencies(file)
        
    client:
      debug: debug
      update: (data) ->
        console.log data.body if @debug
        eval("(function() { #{data.body} })")()