class window.DesignIO
  constructor: (options) ->
    options     ||= {}
    @callbacks    = {}
    @stylesheets  = {}
    @javascripts  = {}
    @watchers     = []
    @port         = options.port  || 4181
    @url          = options.url   || "#{window.location.protocol}://#{window.location.hostname}:#{@port}"
    @socket       = io.connect(@url)
    
    @connect()
    
  connect: ->
    socket  = @socket
    self    = @
    socket.on 'connect', ->
      socket.emit 'userAgent', self.userAgent()
      socket.on 'watch', (data) ->
        self.watch(data)
      socket.on 'exec', (data) ->
        self.exec(data)
  
  # on "ready"  
  on: (name, callback) ->
    @callbacks[name] = callback
    
  runCallback: (name, data) ->
    @callbacks[name].call(@, data) if @callbacks[name]
    true
    
  watch: (data) ->
    watchers  = data.body
    actions   = ["create", "update", "delete"]
    
    for watcher in watchers
      watcher.match = eval(watcher.match)
      
      for action in actions
        watcher[action] = eval(watcher[action]) if watcher.hasOwnProperty(action)
      
      for pattern, i in watcher.patterns
        watcher.patterns[i] = new RegExp(pattern.source, pattern.options)
    
    @watchers = watchers
  
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

    @socket.emit 'log', data
  
  userAgent: ->
    userAgent:  window.navigator.userAgent
    url:        window.location.href
