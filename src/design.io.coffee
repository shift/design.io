module.exports =
  watcher:    require './design.io/watcher'
  command:    require './design.io/command'
  connection: require './design.io/connection'
  extension:     (name) ->
    require("./design.io/plugins/#{name}").apply(@, Array.prototype.slice.call(arguments, 1, arguments.length))