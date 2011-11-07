{spawn, exec}  = require 'child_process'

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