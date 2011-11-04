{spawn, exec}  = require 'child_process'

program = require('commander')

program
  .option('-w, --watch [value]', 'directory to watch files from')
  .parse(process.argv)
  
unless program.watch
  throw new Error("You must pass a directory to the --watch [path] option")

server = spawn "node", ["#{__dirname}/design-server"]
server.stdout.on 'data', (data) -> console.log data.toString().trim()
server.stderr.on 'data', (data) -> console.log data.toString().trim()

watcher = spawn "node", ["#{__dirname}/design-watcher", "--watch", program.watch]
watcher.stdout.on 'data', (data) -> console.log data.toString().trim()
watcher.stderr.on 'data', (data) -> console.log data.toString().trim()
