fs          = require 'fs'
path        = require 'path'
uuid        = require 'node-uuid'
async       = require 'async'
Shift       = require 'shift'
request     = require 'request'
Pathfinder  = require 'pathfinder'
require 'underscore.logger'

class Watcher
  @initialize: (options = {}) ->
    @directory  = options.directory
    @pathfinder = new Pathfinder(@directory)
    @watchfile  = options.watchfile
    @port       = options.port
    @url        = options.url
    
    throw new Error("You must specify the watchfile") unless @watchfile
    throw new Error("You must specify the directory to watch") unless @directory
    
    @read ->
      new (require('./listener/mac')) Watcher.pathfinder.root, (path, options) -> 
        Watcher.changed(path, options)
      
    @
    
  @read: (callback) ->
    self = @
    
    fs.readFile @watchfile, "utf-8", (error, result) ->
      engine = new Shift.CoffeeScript
      engine.render result, (error, result) ->
        context = "
        function() {
          var watch       = this.watch;
          var ignorePaths = this.ignorePaths;
          var watcher     = this.watcher;
          global.Watcher  = require('./watcher');
          #{result}
          delete global.Watcher
        }
        "
        
        eval("(#{context})").call(new Watcher.Watchfile)
        
        callback.call(self) if callback
  
  @store: ->
    @_store ||= []
    
  @all: @store
  
  @create: ->
    @store().push new @(arguments...)
    
  @update: ->
    @read @connect
  
  @connect: ->
    @broadcast "watch", body: @toJSON()
    
  @toJSON: ->
    watchers  = @all()
    data      = []

    for watcher in watchers
      data.push watcher.toJSON()
    
    data
    
  @replacer: (key, value) ->
    if typeof value == "function" || value instanceof RegExp
      "(#{value})"
    else
      value
  
  @reviver: (key, value) ->
    if typeof value == "string" && 
    # match start of function or regexp
    !!value.match(/^(?:\(function\s*\([^\)]*\)\s*\{|\(\/)/) && 
    # match end of function or regexp
    !!value.match(/(?:\}\s*\)|\/\w*\))$/)
      eval(value)
    else
      value
      
  @queue: async.queue((change, callback) ->
    Watcher.change(change.path, change.options, callback)
  , 1)
  
  @change: (path, options, callback) ->
    watchers  = @all()
    action    = options.action
    timestamp = options.timestamp
    
    iterator  = (watcher, next) ->
      if watcher.match(path)
        watcher.path      = path
        watcher.action    = action
        watcher.timestamp = timestamp
        
        try
          switch watcher[action].length
            when 1 then throw Error("You must specify a callback in your watcher")
            when 2 then watcher[action].call(watcher, path, next)
            when 3 then watcher[action].call(watcher, path, options, next)
        catch error
          console.log(error.stack)
          next()
        # make async
        # delete watcher.path
        # delete watcher.action
        # delete watcher.timestamp
        
        #break unless success
      else
        next()
        
    async.forEachSeries watchers, iterator, (error) ->
      process.nextTick(callback)
  
  @changed: (path, options = {}) ->
    @queue.push path: path, options: options
        
  @log: (data) ->
    watchers = @all()
    path      = data.path
    action    = data.action
    timestamp = data.timestamp
    
    for watcher in watchers
      if watcher.hasOwnProperty("server") && 
      watcher.server.hasOwnProperty(action) && 
      watcher.id == data.id
        server.watcher   = watcher
        server.path      = path
        server.action    = action
        server.timestamp = timestamp
        try
          !!server[action](data)
        catch error
          console.log(error.stack)
          
  
  @broadcast: (action, data, callback) ->
    self      = @
    replacer  = @replacer
    params    =
      url:      "#{@url}/design.io/#{action}"
      method:   "POST"
      body:     JSON.stringify(data, replacer)
      headers:
        "Content-Type": "application/json"
    
    request params, (error, response, body) ->
      if !error && response.statusCode == 200
        callback.call(self, null, response) if callback
        true
      else
        error = if error then error.stack else response.body
        
        if callback
          callback.call(self, error, null)
        else
          console.log(error)
  
  constructor: ->
    args      = Array.prototype.slice.call(arguments, 0, arguments.length)
    methods   = args.pop()
    methods   = methods.call(@) if typeof methods == "function"
    args = args[0] if args[0] instanceof Array
    @ignore   = null
    @patterns = []
    for arg in args
      @patterns.push if typeof arg == "string" then new RegExp(arg) else arg
    @[key]    = value for key, value of methods
    
    @id     ||= uuid()
    @server.watcher = @ if @hasOwnProperty("server")
    
  initialize: (path, callback) ->
  
  # Example:
  # 
  #     create: (path) ->
  #       ext = RegExp.$1
  create: (path, callback) ->
    @update(path, callback)
    
  update: (path, callback) ->
    self = @
    
    fs.readFile path, 'utf-8', (error, result) ->
      return self.error(error) if error
      self.broadcast body: result, callback
    
  destroy: (path, callback) ->
    @broadcast(callback)
    
  updateAll: ->
    Watcher.update()
    
  error: (error, callback) ->
    #_console.error if error.hasOwnProperty("message") then error.message else error.toString()
    require('util').puts(error.stack)
    callback() if callback
    false
    
  match: (path) ->
    return false if @ignore && !!@ignore.exec(path)
    patterns = @patterns
    for pattern in patterns
      return true if !!pattern.exec(path)
    false
    
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
    data.id       = @id
    action        = args.shift() || "exec"
    @constructor.broadcast action, data, callback
  
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
  
  class @Watchfile
    constructor: ->
      Watcher._store = undefined
    
    ignorePaths: ->
      args = Array.prototype.slice.call(arguments, 0, arguments.length)
      
    watch: ->
      Watcher.create(arguments...)

module.exports = Watcher