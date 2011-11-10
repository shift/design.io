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
    
    throw new Error("You must specify the watchfile") unless @watchfile
    throw new Error("You must specify the directory to watch") unless @directory
    
    @read ->
      require('watch-node')(@directory, (path, prev, curr, action, timestamp) -> Watcher.exec(path, action))
       
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
          global.Watcher  = require('./watcher');
          #{result}
          delete global.Watcher
        }
        "
        
        eval("(#{context})").call(new Watcher.DSL)
        
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
    
  @exec: (path, action, timestamp) ->
    watchers  = @all()
    
    for watcher in watchers
      if watcher.match(path)
        watcher.path      = path
        watcher.action    = action
        watcher.timestamp = timestamp
        
        success           = !!watcher[action](path)
        
        delete watcher.path
        delete watcher.action
        delete watcher.timestamp
        
        break unless success
  
  @broadcast: (action, data) ->
    params  =
      url:      "#{@url}/design.io/#{action}"
      method:   "POST"
      body:     JSON.stringify(data)
      headers:
        "Content-Type": "application/json"
    
    request params, (error, response, body) ->
      if !error && response.statusCode == 200
        #console.log(body)
        true
      else
        console.log error
  
  constructor: ->
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
    console.log error
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
    data    = patterns: []
    
    for pattern in @patterns
      options = []
      options.push "m" if pattern.multiline
      options.push "i" if pattern.ignoreCase
      options.push "g" if pattern.global
      data.patterns.push source: pattern.source, options: options.join("")
      
    data.match = "(#{@match.toString()})"
    
    if @hasOwnProperty("client")
      actions = ["create", "update", "delete"]
      client  = @client
      for action in actions
        data[action] = "(#{client[action].toString()})" if client.hasOwnProperty(action)
        
    data
  
  class @DSL
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