class window.DesignIO
  constructor: (options) ->
    options     ||= {}
    @callbacks    = {}
    @stylesheets  = {}
    @javascripts  = {}
    @watchers     = []
    @port         = options.port  || 4181
    @url          = options.url   || "#{window.location.protocol}//#{window.location.hostname}:#{@port}/design.io"
    @socket       = io.connect(@url)
    
    @connect()
    
  connect: ->
    socket  = @socket
    self    = @
    socket.on 'connect', ->
      socket.emit 'userAgent', self.userAgent()
      socket.on 'watch', (data) ->
        console.log data
        self.watch JSON.parse(data, self.reviver)
      socket.on 'exec', (data) ->
        self.exec JSON.parse(data, self.reviver)
  
  # on "create"
  on: (name, callback) ->
    @callbacks[name] = callback
    
  runCallback: (name, data) ->
    @callbacks[name].call(@, data) if @callbacks[name]
    true
    
  watch: (data) ->
    @watchers = data.body
  
  exec: (data) ->
    watchers = @watchers
    
    for watcher in watchers
      if watcher.match(data.path)
        watcher[data.action].call(@, data) if watcher.hasOwnProperty(data.action)
        
    @runCallback data.action, data
  
  log: (data) ->
    if typeof(data) == "object"
      data.userAgent = window.navigator.userAgent
      data.url       = window.location.href
    
    @socket.emit 'log', JSON.stringify(data, @replacer)
  
  userAgent: ->
    userAgent:  window.navigator.userAgent
    url:        window.location.href
    
  replacer: (key, value) ->
    if typeof value == "function"
      "(#{value})"
    else
      value
  
  reviver: (key, value) ->
    if typeof value == "string" && 
    !!value.match(/^(?:\(function\s*\([^\)]*\)\s*\{|\(\/)/) && 
    !!value.match(/(?:\}\s*\)|\/\w*\))$/)
      eval(value)
    else
      value