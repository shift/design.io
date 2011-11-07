class window.DesignIO
  constructor: (options) ->
    options     ||= {}
    @port         = options.port  || 4181
    @url          = options.url   || "http://localhost:#{@port}"
    @socket       = io.connect(@url)
    @callbacks    = {}
    
    @stylesheets  = {}
    @javascripts  = {}
    @watchers     = []
    
    @connect()
    
  connect: ->
    socket  = @socket
    self    = @
    socket.on 'connect', ->
      socket.emit 'userAgent', self.userAgent()
      socket.on 'watch', (data) ->
        self.watch(data)
      socket.on 'change', (data) ->
        self.change(data)
  
  # on "ready"  
  on: (name, callback) ->
    @callbacks[name] = callback
    
  watch: (data) ->
    watcher = {}
    actions = ["create", "update", "delete"]
    for action in actions
      watcher[action] = eval "(#{data[action]})" if data.hasOwnProperty(action)
    
    patterns = []
    for pattern in data.patterns
      patterns.push new RegExp(pattern.pattern, pattern.options)
    watcher.patterns = patterns
    watcher.match = (path) ->
      for pattern in @patterns
        return true if pattern.exec(path)
      return false
      
    @watchers.push(watcher)
  
  change: (data) ->
    watchers = @watchers
    for watcher in watchers
      if watcher.match(data.path)
        watcher[data.action].call(window, data) if watcher.hasOwnProperty(data.action)
    
  userAgent: ->
    userAgent:  window.navigator.userAgent
    url:        window.location.href
