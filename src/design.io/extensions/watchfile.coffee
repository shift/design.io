module.exports = ->
  Watcher.create Watcher.watchfile,
    update: ->
      Watcher.update()
    
    delete: ->
      Watcher.update()