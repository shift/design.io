require 'underscore.logger'

module.exports =
  watcher:    require './design.io/watcher'
  project:    require './design.io/project'
  command:    require './design.io/command'
  extension:     (name) ->
    require("./design.io/extensions/#{name}").apply(@, Array.prototype.slice.call(arguments, 1, arguments.length))