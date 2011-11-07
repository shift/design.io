# http://stackoverflow.com/questions/964631/removing-link-element-with-jquery
module.exports = (options) ->
  @watch options.extensions
    create: (path) ->
      @update(path)
    
    update: (path) ->
      Shift.renderFile path, (error, result) ->
        return @error(error) if error
        @emit path: path, body: result, id: @id(path)
  
    delete: (path) ->
      @emit id: @id(path)
    
    render:
      update: (data) ->
        stylesheets = @stylesheets ||= {}
        stylesheets[data.id].remove() if stylesheets[data.id]?
        node = $("<style id='#{data.id}' type='text/css'>#{data.body}</style>")
        stylesheets[data.id] = node
        $("body").append(node)
      
      destroy: (data) ->
        $("##{data.id}").remove()