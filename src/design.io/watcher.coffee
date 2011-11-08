fs      = require 'fs'
path    = require 'path'
Shift   = require 'shift'
request = require 'request'

class Watcher
  @initialize: (options = {}) ->
    @watchfile  = watchfile = options.watchfile
    @directory  = directory = options.directory
    @port       = options.port
    
    throw new Error("You must specify the watchfile") unless @watchfile
    throw new Error("You must specify the directory to watch") unless @directory
    
    fs.readFile watchfile, "utf-8", (error, result) ->
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
        
        require('watch-node')(directory, (path, prev, curr, action, timestamp) -> Watcher.exec(path, action))
  
  @store: ->
    @_store ||= []
    
  @all: @store
  
  @create: ->
    @store().push new @(arguments...)
    
  @exec: (path, action, timestamp) ->
    watchers  = @all()
    for watcher in watchers
      if watcher.match(path)
        watcher.action = action
        console.log watcher.patterns
        break unless !!watcher[action](path)
        
  @connect: ->
    watchers  = @all()
    watcher.connect() for watcher in watchers
  
  # Example:
  # 
  #     create: (path) ->
  #       ext = RegExp.$1
  create: ->
    @update(arguments...)
    
  update: ->
    
  delete: ->
    
  error: (error) ->
    console.log error
    false
    
  toId: (path) ->
    path.replace(process.cwd() + '/', '').replace(/[\/\.]/g, '-')
    
  match: (path) ->
    patterns = @patterns
    for pattern in patterns
      return true if !!pattern.exec(path)
    return false
    
  # emit data to browser
  broadcast: ->
    args    = Array.prototype.slice.call(arguments, 0, arguments.length)
    data    = args.pop()
    event   = args.shift() || "change"
    
    data.action = @action
    
    params  =
      url:      "http://localhost:#{Watcher.port}/#{event}"
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
        
  connect: ->
    data    = patterns: []
    for pattern in @patterns
      options = []
      options.push "m" if pattern.multiline
      options.push "i" if pattern.ignoreCase
      options.push "g" if pattern.global
      data.patterns.push pattern: pattern.source, options: options.join("")
    
    if @hasOwnProperty("client")
      actions = ["create", "update", "delete"]
      for action in actions
        data[action] = @client[action].toString() if @client.hasOwnProperty(action)
    
    @broadcast "watch", data
  
  constructor: ->
    args      = Array.prototype.slice.call(arguments, 0, arguments.length)
    methods   = args.pop()
    methods   = methods.call(@) if typeof methods == "function"
    args = args[0] if args[0] instanceof Array
    @patterns = []
    for arg in args
      @patterns.push if typeof arg == "string" then new RegExp(arg) else arg
    @[key]    = value for key, value of methods
  
  class @DSL
    ignorePaths: ->
      args = Array.prototype.slice.call(arguments, 0, arguments.length)
      
    watch: ->
      Watcher.create(arguments...)
    
    # for plugins, like Guard, TODO
    watcher: (name, options = {}) ->
      require("design.io-#{name}")(options)

module.exports = Watcher