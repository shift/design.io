module.exports = ->
  Watcher.create Watcher.watchfile,
    update: ->
      Watcher.update()
    
    destroy: ->
      Watcher.update()