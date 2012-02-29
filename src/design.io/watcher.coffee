fs          = require 'fs'
path        = require 'path'
uuid        = require 'node-uuid'
Pathfinder  = require 'pathfinder'
Project     = require './project'
File        = Pathfinder.File
require 'underscore.logger'

# Each `watch` declaration in a Watchfile creates a `Watcher`.
#
# There is one Watchfile per project (directory).  So essentially, a project has many watchers.
# 
# @author Lance Pollard
class Watcher
  constructor: (project, args...) ->
    @project  = project
    methods   = args.pop()
    methods   = methods.call(@) if typeof methods == "function"
    args = args[0] if args[0] instanceof Array
    @ignore   = null
    @patterns = []
    
    for arg in args
      continue unless arg
      @patterns.push(if typeof arg == "string" then new RegExp(arg) else arg)
      
    @[key]    = value for key, value of methods
    
    @id     ||= uuid()
    @server.watcher = @ if @hasOwnProperty("server")
    
  initialize: (path, callback) ->
    callback()
  
  # Example:
  # 
  #     create: (path) ->
  #       ext = RegExp.$1
  create: (path, callback) ->
    @update(path, callback)
    
  update: (path, callback) ->
    fs.readFile path, 'utf-8', (error, result) =>
      return @error(error) if error
      @broadcast body: result, callback
    
  destroy: (path, callback) ->
    @broadcast(callback)
    
  updateAll: ->
    Watcher.update()
    
  error: (error, callback) ->
    console.log(error.stack || error) unless @action == "initialize"
    
    if @project.growl
      require("growl")(error.message, title: @project.namespace, sticky: false)
      
    callback() if callback
    false
    
  match: (path) ->
    return false if @ignore && !!@ignore.exec(path)
    patterns = @patterns
    
    for pattern in patterns
      return true if !!pattern.exec(path)
    false
    
  invoke: (path, options, next) ->
    action    = options.action
    timestamp = options.timestamp
    duration  = options.duration
    
    if @match(path)
      @path      = path
      @action    = action
      @timestamp = timestamp
      
      watcherCallback   = (error) =>
        clearTimeout(timeout)
        console.log(error.stack || error) if error
        process.nextTick(next)
        
      timeoutError = =>
        watcherCallback(new Error("Watcher for #{@patterns.toString()} timed out.  Make sure you have and call a callback in each watcher method (e.g. update: function(path, callback))"))
      
      timeout = setTimeout(timeoutError, duration)
      
      try
        switch @[action].length
          when 0, 1
            @[action].call @, path
            watcherCallback()
          when 2
            @[action].call @, path, watcherCallback
          when 3
            @[action].call @, path, options, watcherCallback
      catch error
        watcherCallback(error)
      # make async
      # delete watcher.path
      # delete watcher.action
      # delete watcher.timestamp
    
      #break unless success
    else
      next()
    
  # send data to all browsers
  broadcast: ->
    args          = Array.prototype.slice.call(arguments, 0, arguments.length)
    callback      = args.pop()
    if typeof(callback) == "function"
      data        = args.pop() || {}
    else
      data        = callback
      callback    = null
    data.action ||= @action
    data.path   ||= @path
    data.id         = @id
    data.timestamp  = @timestamp
    data.namespace  = @project.namespace
    action          = args.shift() || "exec"
    @project.broadcast action, data, callback
  
  toJSON: ->
    data    = 
      patterns: @patterns
      match:    @match
      id:       @id
      
    if @hasOwnProperty("client")
      # actions = ["create", "update", "destroy", "connect"]
      client  = @client
      for key, value of client
        data[key] = value#client[action] if client.hasOwnProperty(action)
        
    data

module.exports = Watcher
