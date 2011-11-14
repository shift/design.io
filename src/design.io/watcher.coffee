fs      = require 'fs'
path    = require 'path'
Shift   = require 'shift'
request = require 'request'

class Watcher
  @initialize: (options = {}) ->
    @directory  = options.directory
    @watchfile  = options.watchfile
    @port       = options.port
    @url        = options.url
    @logger     = require('../design.io').logger
    
    throw new Error("You must specify the watchfile") unless @watchfile
    throw new Error("You must specify the directory to watch") unless @directory
    
    @read ->
      listener = new (require('./listener/mac'))(options.directory)
      listener.listen (path, options) -> 
        Watcher.exec(path, options)
      
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
        
        callback.call(@) if callback
  
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
    
  @exec: (path, options = {}) ->
    watchers  = @all()
    action    = options.action
    timestamp = options.timestamp
    
    for watcher in watchers
      if watcher.match(path)
        watcher.path      = path
        watcher.action    = action
        watcher.timestamp = timestamp
        
        try
          success           = !!watcher[action].call(watcher, path, options)
        catch error
          console.log error
        # make async
        # delete watcher.path
        # delete watcher.action
        # delete watcher.timestamp
        
        #break unless success
  
  @broadcast: (action, data) ->
    replacer = @replacer
    params  =
      url:      "#{@url}/design.io/#{action}"
      method:   "POST"
      body:     JSON.stringify(data, replacer)
      headers:
        "Content-Type": "application/json"
    
    request params, (error, response, body) ->
      if !error && response.statusCode == 200
        #console.log(body)
        true
      else
        if error
          console.log error
        else
          console.log response.body
  
  constructor: ->
    @logger   = @constructor.logger
    args      = Array.prototype.slice.call(arguments, 0, arguments.length)
    methods   = args.pop()
    methods   = methods.call(@) if typeof methods == "function"
    args = args[0] if args[0] instanceof Array
    @patterns = []
    for arg in args
      @patterns.push if typeof arg == "string" then new RegExp(arg) else arg
    @[key]    = value for key, value of methods
  
  # Example:
  # 
  #     create: (path) ->
  #       ext = RegExp.$1
  create: (path) ->
    @update(path)
    
  update: (path) ->
    self = @
    
    fs.readFile path, 'utf-8', (error, result) ->
      return self.error(error) if error
      self.broadcast body: result
    
  delete: ->
    @broadcast()
    
  error: (error) ->
    @constructor.logger.error if error.hasOwnProperty("message") then error.message else error.toString()
    false
    
  toId: (path) ->
    path.replace(process.cwd() + '/', '').replace(/[\/\.]/g, '-')
    
  match: (path) ->
    patterns = @patterns
    for pattern in patterns
      return true if !!pattern.exec(path)
    false
    
  # send data to all browsers
  broadcast: ->
    args          = Array.prototype.slice.call(arguments, 0, arguments.length)
    data          = args.pop() || {}
    data.action ||= @action
    data.path   ||= @path
    data.id     ||= @toId(data.path)
    action        = args.shift() || "exec"
    
    @constructor.broadcast action, data
  
  toJSON: ->
    data    = 
      patterns: @patterns
      match:    @match
      
    if @hasOwnProperty("client")
      actions = ["create", "update", "delete"]
      client  = @client
      for action in actions
        data[action] = client[action] if client.hasOwnProperty(action)
        
    data
  
  class @Watchfile
    constructor: ->
      Watcher._store = undefined
    
    ignorePaths: ->
      args = Array.prototype.slice.call(arguments, 0, arguments.length)
      
    watch: ->
      Watcher.create(arguments...)
    
    # for plugins, like Guard, TODO
    watcher: (name, options = {}) ->
      require("design.io-#{name}")(options)

module.exports = Watcher