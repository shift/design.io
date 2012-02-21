module.exports = ->
  project = require("../project").find()
  project.createWatcher project.watchfile,
    update: ->
      @updateAll()
    
    destroy: ->
      @updateAll()