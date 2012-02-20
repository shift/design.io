class Mac extends (require('../listener'))
  constructor: (options, callback) ->
    super
    
    forever = require("forever")
    
    child = forever.start ["ruby","#{__dirname}/mac.rb", @root.replace(" ", "\\ ")],
      max : 10
      silent : true
    
    child.on "stdout", (data) =>
      data = data.toString().trim()
      try
        data = JSON.parse("[" + data.replace(/\]\[/g, ",").replace(/[\[\]]/g, "") + "]")
        # console.log(data.toString().trim())
        for path in data
          @changed(path[0..-2], callback)
      catch error
        _console.error error.toString()
    
    child.on "stderr", (data) ->
      _console.error data.toString().trim()
    
    forever.startServer(child)
      
module.exports = Mac
