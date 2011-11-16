class window.DesignIO
  constructor: (options) ->
    options     ||= {}
    @callbacks    = {}
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
        self.watch data
      socket.on 'exec', (data) ->
        self.exec data
  
  # on "create"
  on: (name, callback) ->
    @callbacks[name] = callback
    
  runCallback: (name, data) ->
    @callbacks[name].call(@, data) if @callbacks[name]
    true
    
  watch: (data) ->
    @watchers = watchers = JSON.parse(data, @reviver).body
    for watcher in watchers
      watcher.client = @
      watcher.log = (data) ->
        data.path       ||= @path
        data.action     ||= @action
        data.timestamp  ||= new Date
        data.id           = @id
        @client.log(data)
      watcher.connect() if watcher.hasOwnProperty("connect")
  
  exec: (data) ->
    data    = JSON.parse(data, @reviver)
    
    watchers = @watchers
    
    for watcher in watchers
      if watcher.id == data.id
        watcher.path    = data.path # tmp set
        watcher.action  = data.action
        watcher[data.action](data) if watcher.hasOwnProperty(data.action)
        
    @runCallback data.action, data
  
  # id, path, then anything else
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