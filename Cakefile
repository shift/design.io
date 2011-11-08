{spawn, exec}   = require 'child_process'
Shift           = require 'shift'
fs              = require 'fs'

task 'coffee', ->
  coffee = spawn './node_modules/coffee-script/bin/coffee', ['-o', 'lib', '-w', 'src']
  coffee.stdout.on 'data', (data) -> console.log data.toString().trim()
  coffee = spawn './node_modules/coffee-script/bin/coffee', ['-o', 'spec', '-w', 'spec']
  coffee.stdout.on 'data', (data) -> console.log data.toString().trim()
  
task 'spec', ->
  jasmine = spawn './node_modules/jasmine-node/bin/jasmine-node', ['--coffee', './spec']
  jasmine.stdout.on 'data', (data) -> console.log data.toString().trim()

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
      compressor.render result, (error, result) ->
        fs.writeFile "design.io.js", result