_path           = require 'path'
Pathfinder      = require 'pathfinder'
File            = Pathfinder.File

class Listener
  constructor: (root, options = {}) ->
    @root         = root
    @directories  = {}
    @files        = {}
    @logger       = require('../design.io').logger
    
  listen: (callback) ->
    files = @files
    root  = @root
    paths = require('findit').sync(root)
    for source in paths
      stat = File.stat(source)
      unless stat.isDirectory()
        files[_path.join(root, source.replace(root, ""))] = stat
    
  log: (path, options = {}, callback) ->
    @logger.info "#{options.action}d #{path}" # #{options.timestamp.toLocaleTimeString()} - 
    try
      callback.call(@, path, options)
    catch error
      @logger.error error.message
  
  changed: (path, callback) ->
    entries     = File.entries(path)
    action      = null
    timestamp   = new Date
    directories = @directories
    files       = @files
    base        = @root
    
    if directories[path] && entries.length < directories[path].length
      directories       = @directories
      action            = "delete"
      deleted           = directories[path].filter (i) -> !(entries.indexOf(i) > -1)
      directories[path] = entries
      relativePath      = File.join(path, deleted[0]).replace(base + '/', '')
      
      @log relativePath, action: action, timestamp: timestamp, callback
      
      return
    
    directories[path] = entries
    
    for entry in entries
      continue if entry == '.' || entry == '..'
      
      absolutePath  = File.join(path, entry)
      current       = File.stat(absolutePath)
      
      continue if current.isDirectory()
      
      previous    = files[absolutePath]
      changed     = !(previous && current.size == previous.size && current.mtime.getTime() == previous.mtime.getTime())
      
      continue unless changed
      
      files[absolutePath] = current
      
      if !previous
        action ||= "create"
      else
        action ||= "update"
      
      relativePath  = absolutePath.replace(base.toString() + '/', '')
      
      @log relativePath, action: action, timestamp: timestamp, previous: previous, current: current, callback
  
require './listener/mac'
require './listener/polling'
require './listener/windows'

module.exports = Listener
