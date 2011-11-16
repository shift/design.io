{spawn, exec}   = require 'child_process'
Shift           = require 'shift'
fs              = require 'fs'

task 'coffee', ->
  coffee = spawn './node_modules/coffee-script/bin/coffee', ['-o', 'lib', '-w', 'src']
  coffee.stdout.on 'data', (data) -> console.log data.toString().trim()
  #coffee2 = spawn './node_modules/coffee-script/bin/coffee', ['-w', 'spec', '-o', 'spec']
  #coffee2.stdout.on 'data', (data) -> console.log data.toString().trim()
  #coffee2.stderr.on 'data', (data) -> console.log data.toString().trim()

task 'spec', 'Run jasmine specs', ->
  spec = spawn './node_modules/jasmine-node/bin/jasmine-node', ['--coffee', './spec']
  spec.stdout.on 'data', (data) ->
    data = data.toString().replace(/^\s*|\s*$/g, '')
    if data.match(/\u001b\[3\dm[\.F]\u001b\[0m/)
      sys.print data
    else
      data = "\n#{data}" if data.match(/Finished/)
      console.log data
  spec.stderr.on 'data', (data) -> console.log data.toString().trim()

task 'watch-old', 'Compile assets', ->
  watcher = spawn "node", ["./lib/design.io/watcher", "--directory", "./spec", "--watchfile", "Watchfile"]
  watcher.stdout.on 'data', (data) -> console.log data.toString().trim()
  watcher.stderr.on 'data', (data) -> console.log data.toString().trim()

task 'watch', ->
  Watcher = require './lib/design.io/watcher'
  Watcher.initialize watchfile: "Watchfile", directory: process.cwd(), port: 4181
  
task 'build', ->
  engine = new Shift.CoffeeScript
  compressor = new Shift.UglifyJS
  
  fs.readFile "./src/design.io/client.coffee", "utf-8", (error, result) ->
    engine.render result, (error, result) ->
      fs.writeFile "design.io.js", result
      compressor.render result, (error, compressed) ->
        fs.writeFile "design.io.min.js", compressed