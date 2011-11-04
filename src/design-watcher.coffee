fs      = require 'fs'
path    = require 'path'
Shift   = require 'shift'
watch   = require 'watch-node'
program = require 'commander'

program
  .option('-w, --watch [value]', 'directory to watch files from')
  .parse(process.argv)

watch program.watch, (file) ->
  id = file.replace(process.cwd() + '/', '').replace(/[\/\.]/g, '-')
  
  fs.readFile file, 'utf-8', (error, content) ->
    throw error if error
    
    extension   = path.extname(file)
    engine      = Shift.engine extension
    
    outputExtension = switch extension
      when ".coffee", ".ejs", ".js" then "js"
      when ".styl", ".less", ".sass", ".css" then "css"
    
    emit = (output) ->
      request = require('request')
      
      data = {}
      data[outputExtension] = 
        body: output
        path: file
        id: id
      
      params =
        url:      'http://localhost:4181'
        method:   'POST'
        body:     JSON.stringify(data)
        headers:
          "Content-Type": "application/json"
          
      console.log data
      request params, (error, response, body) ->
        if !error && response.statusCode == 200
          console.log(body)
        else
          console.log error
    
    if engine
      engine.render content, (error, output) ->
        emit(output)
    else
      emit(content)