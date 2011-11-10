class Command
  constructor: (argv) ->
    @program = program = require('commander')

    program
      .option('-d, --directory [value]', 'directory to watch files from')
      .option('-w, --watchfile [value]', 'location of Watchfile')
      .option('-p, --port <n>', 'port for the socket connection')
      .option('-u, --url [value]', 'URL for the socket connection')
      .option('-i, --interval <n>', 'interval (in milliseconds) files should be scanned (only useful if you can\'t use FSEvents).  Not implemented')
      .parse(process.argv)

    program.directory ||= process.cwd()
    program.watchfile ||= "Watchfile"
    program.port      = if program.port then parseInt(program.port) else (process.env.PORT || 4181)
    program.url       ||= "http://localhost:#{program.port}"
    
  run: ->
    program = @program
    
    require('./watcher').initialize
      watchfile:  program.watchfile
      directory:  program.directory
      port:       program.port
      url:        program.url
    
module.exports = Command
