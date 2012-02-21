Hook      = require("hook.io").Hook
File      = require("pathfinder").File
Watcher   = require("./watcher")

# This is the base class.
#
# The server keeps track of all the projects in `Project.store()`.
class Project
  @store: ->
    @_store ||= {}
    
  @all: @store
  
  @timeout: 10 * 1000
  
  @find: (namespace) ->
    if namespace
      @all()[namespace]
    else
      cwd = process.cwd()
      for project in @all()
        return project if project.root == cwd
      null
  
  replacer: (key, value) ->
    if value instanceof RegExp
      "(function() { return new RegExp('#{value}') })"
    else if typeof value == "function"
      "(#{value})"
    else
      value
  
  reviver: (key, value) ->
    if typeof value == "string" && 
    # match start of function or regexp
    !!value.match(/^(?:\(function\s*\([^\)]*\)\s*\{|\(\/)/) && 
    # match end of function or regexp
    !!value.match(/(?:\}\s*\)|\/\w*\))$/)
      eval(value)
    else
      value
  
  constructor: (options = {}) ->
    @root         = File.absolutePath(options.root)
    @namespace    = options.namespace
    @watchfile    = File.absolutePath(options.watchfile)
    @ignoredPaths = []
    @watchers     = []
    
    throw new Error("You must specify the watchfile") unless @watchfile
    throw new Error("You must specify the directory to watch") unless @root
    
    store = @constructor.store()
    throw new Error("Only one project per namespace") if store.hasOwnProperty(@namespace)
    store[@namespace]     = @
    
    @hook       = new Hook(name: "design.io-watcher", debug: true)
    
  watch: ->
    hook = @hook
    
    hook.on "hook::ready", (data) =>
      hook.emit "ready", data
      
      @read =>
        new (require('./listener/mac')) root: @root, ignore: @ignoredPaths, (path, options) =>
          options.namespace = command.namespace
          options.paths     = if path instanceof Array then path else [path]

          @changed(path, options)  
      @
      
    hook.start()
    
    @
  
  createWatcher: ->
    @watchers.push new Watcher(@, arguments...)
    
  read: (callback) ->
    Watcher.ignoredPaths = []
    fs.readFile @watchfile, "utf-8", (error, result) =>
      engine      = new Shift.CoffeeScript
      mainModule  = require.main
      paths       = mainModule.paths
      mainModule.moduleCache and= {}
      mainModule.filename = '.'
      
      if process.binding('natives').module
        {Module} = require 'module'
        mainModule.paths = Module._nodeModulePaths(File.dirname(@watchfile))
      
      result = """
      __project = require("design.io/lib/design.io/project").find("#{@namespace}")
      
      ignorePaths = ->
        __project.ignoredPaths ||= []
        __project.ignoredPaths = __project.ignoredPaths.concat Array.prototype.slice.call(arguments, 0, arguments.length)

      watch = ->
        __project.createWatcher(arguments...)
        
      #{result}
      """
      
      engine.render result, (error, result) =>
        mainModule._compile result, mainModule.filename
        #eval("(#{context})").call()
        callback.call(@) if callback
  
  changed: (path, options = {}) ->
    @queue.push path: path, options: options  
  
  queue: async.queue((change, callback) ->
    @change(change.path, change.options, callback)
  , 1)
  
  change: (path, options, callback) ->
    watchers  = @watchers
    options.duration ||= @constructor.timeout
    
    iterator  = (watcher, next) ->
      watcher.invoke(path, options, next)
      
    async.forEachSeries watchers, iterator, (error) ->
      process.nextTick(callback)
  
  toJSON: ->
    watchers  = @watchers
    data      = []
    
    for watcher in watchers
      data.push watcher.toJSON()

    data
  
  update: ->
    @read @connect
    
  connect: ->
    @broadcast "watch", body: @toJSON()  
  
  broadcast: (action, data, callback) ->
    #if data.action == "initialize"
    #  callback.call(@, null, null) if callback
    #  return
    
    data      = JSON.stringify(data, @replacer)
    # url       = "#{@url}/design.io/#{action}"
    
    @hook.emit action, data
  
  # @todo
  log: (data) ->
    watchers  = @watchers
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
  
  class @Watchfile
    constructor: ->
      Watcher._store = undefined
    
    ignorePaths: ->
      Project.ignoredPaths ||= []
      Project.ignoredPaths = Project.ignoredPaths.concat Array.prototype.slice.call(arguments, 0, arguments.length)
      
    watch: ->
      Project.createWatcher(arguments...)