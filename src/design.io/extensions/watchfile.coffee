module.exports = ->
  Watcher.create Watcher.watchfile,
    update: ->
      @updateAll()
    
    destroy: ->
      @updateAll()