class Client
  constructor: (options) ->
    options   ||= {}
    @port       = options.port || 4181
    @url        = options.url || "http://localhost:#{@port}"
    @socket     = io.connect(@url)
    @callbacks  = {}
    
    @stylesheets = {}
    @javascripts = {}
    
    @connect()
    
  connect: ->
    socket  = @socket
    self    = @
    socket.on 'connect', ->
      socket.emit 'userAgent', self.userAgent()
      socket.on 'update', (changes) ->
        self.runCallback("update", changes)
  
  # on "ready"  
  on: (name, callback) ->
    @callbacks[name] = callback
  
  runCallback: (name, options) ->
    if @callbacks[name]?
      @callbacks[name].call(this, options)
    else
      @[name](options)
      
  update: (data) ->
    @updateStylesheets(data.css) if data.css
    @updateJavaScripts(data.js) if data.js
    true
    
  updateStylesheets: (data) ->
    stylesheets = @stylesheets
    
    stylesheets[data.id].remove() if stylesheets[data.id]?
    
    node = $("<style id='#{data.id}' type='text/css'>#{data.body}</style>")
    
    stylesheets[data.id] = node
    
    $("body").append(node)
    
  updateJavaScripts: (data) ->
    javascripts = @javascripts
    console.log "HERE!! #{data.id}"
    javascripts[data.id].remove() if javascripts[data.id]?

    node = $("<script id='#{data.id}' type='text/javascript'>#{data.body}</script>")
    
    javascripts[data.id] = node
    
    $("body").append(node)
    
  userAgent: ->
    userAgent: window.navigator.userAgent
    url: window.location.href

window.designer = new Client()