module.exports = (options) ->
  watch ".png", ".jpg", ->
    @server (path) -> 
      @emit path: path, data: transform(path)
  
    @client (data) ->
      $("##{data.id}").attr("src", data.url)
