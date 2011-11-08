class Command
  constructor: (argv) ->
    @program = program = require('commander')

    program
      .option('-d, --directory [value]', 'directory to watch files from')
      .option('-w, --watchfile [value]', 'location of Watchfile')
      .option('-p, --port <n>', 'port for the socket connect')
      .option('-i, --interval <n>', 'interval (in milliseconds) files should be scanned (only useful if you can\'t use FSEvents).  Not implemented')
      .parse(process.argv)

    program.directory ||= process.cwd()
    program.watchfile ||= "Watchfile"
    program.port      = if program.port then parseInt(program.port) else 4181
    
module.exports = Command
