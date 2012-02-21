module.exports = ->
  Watcher.create require("../project").find().watchfile,
    update: ->
      @updateAll()
    
    destroy: ->
      @updateAll()