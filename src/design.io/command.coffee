global._console ||= require("underscore.logger")
fs  = require 'fs'

forever = require "forever"

command = (argv) ->
  program = require("commander")
  
  version = JSON.parse(fs.readFileSync(__dirname + "/../../package.json", "utf-8")).version
  
  program
    .version(version)
    .option("-d, --directory [value]", "directory to watch files from")
    .option("-w, --watchfile [value]", "location of Watchfile")
    .option("-p, --port <n>", "port for the socket connection")
    .option("--debug", "Debug?")
    .option("-u, --url [value]", "URL for the socket connection")
    .option("-i, --interval <n>", "interval (in milliseconds) files should be scanned (only useful if you can't use FSEvents).  Not implemented")
    .option("-n, --namespace [value]", "Namespace for the project")
    .option("--growl", "Namespace for the project")
    .parse(process.argv)

  program.directory ||= process.cwd()
  program.watchfile ||= "Watchfile"
  program.port      = if program.port then parseInt(program.port) else (process.env.PORT || 4181)
  program.url       ||= "http://localhost:#{program.port}"
  program.command   = program.args[0] || "watch"
  program.root      = process.cwd()
  program.growl     = !!program.growl
  unless program.namespace
    slug = process.cwd().split("/")
    slug = slug[slug.length - 1]
    slug = slug.replace(/\.[^\.]+$/, "")
    program.namespace = slug
  
  program
  
command.run = (argv) ->
  program = command(argv)
  args    = argv.concat()[2..-1]
  child = switch program.command
    when "start"
      forever.start ["node", "#{__dirname}/command/start.js"].concat(args), silent: false, max: 1
    when "stop"
      forever.start ["node", "#{__dirname}/command/stop.js"].concat(args), silent: true, max: 1
    else
      forever.start ["node", "#{__dirname}/command/watch.js"].concat(args), silent: false
  
  child.on "start", (data) ->
    console.log data
  
  child.on "exit", ->
    
  child.on "stop", ->
  
  child.on "stdout", (data) ->
  
  child.on "stderr", (error) ->
    console.log error.toString()
  
  child.on "error", ->
  
  forever.startServer(child)
  
  program
  
module.exports = command
