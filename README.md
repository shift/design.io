# Design.io

> CSS3 + TextMate + Node.js = Real-Time Web Design

## Video Tutorial

[![Here's a video tutorial on vimeo](http://i.imgur.com/JunAS.png)](http://player.vimeo.com/video/31589739?title=0&amp;byline=0&amp;portrait=0&autoplay=true)

Here is the [example app](https://github.com/viatropos/design.io-example) for the video.

## Install

```
npm install design.io
```

## Usage

```
design.io
```

That `design.io -d [directory]` command will watch a directory for changes and inject JavaScripts and StyleSheets into the LIVE example web app whenever you hit save.  It does it in a clean an optimized way.

So, edit the files in `./src` and watch the stuff in the page change in real time.

## Watchfile

This is basically what a blank `watch` task looks like:

``` coffeescript
watch /\.(styl|less|sass|scss|css)$/
  create: (path) ->
    @update(path)
    
  update: (path) ->
  
  delete: (path) ->
    @emit id: @id(path)
  
  client:
    # id, path, body
    create: (data) ->
  
    update: (data) ->
      
    delete: (data) ->
      
```

## Using Extensions

Design.io comes with two basic extensions:

1. Stylesheet watching/compressing/injecting
2. JavaScript watching/compressing/injecting

You can include them in your watchfile like this:

``` coffeescript
require("design.io/watcher/stylesheets")(compress: true)
require("design.io/watcher/javascripts")()

watch /\.md$/ #...
```

## Creating Extensions

Take a look at the `src/design.io/watcher` directory for more examples, but here's one that watches stylesheets and/or css templates and injects them into the browser, optionally compressing them.

``` coffeescript
Shift = require 'shift'
_path = require 'path'
fs    = require 'fs'

module.exports = (options = {}) ->
  patterns = options.patterns || [/\.(styl|less|css|sass|scss)$/]
  
  if options.hasOwnProperty("compress") && options.compress == true
    compressor = new Shift.YuiCompressor
  
  Watcher.create patterns,
    create: (path) ->
      @update(path)
    
    update: (path) ->
      self = @
      
      fs.readFile path, 'utf-8', (error, result) ->
        engine = Shift.engine(_path.extname(path))
        
        if engine
          engine.render result, (error, result) ->
            return self.error(error) if error
            if compressor
              compressor.render result, (error, result) ->
                return self.error(error) if error
                self.broadcast id: self.toId(path), path: path, body: result
            else
              self.broadcast id: self.toId(path), path: path, body: result
        else
          if compressor
            compressor.render result, (error, result) ->
              return self.error(error) if error
              self.broadcast path: path, body: result, id: self.toId(path)
          self.broadcast id: self.toId(path), path: path, body: result
      true
        
    delete: (path) ->
      @broadcast id: @toId(path), path: path
    
    client:
      # this should get better so it knows how to map template files to browser files
      update: (data) ->
        stylesheets = @stylesheets ||= {}
        stylesheets[data.id].remove() if stylesheets[data.id]?
        node = $("<style id='#{data.id}' type='text/css'>#{data.body}</style>")
        stylesheets[data.id] = node
        $("body").append(node)
      
      delete: (data) ->
        stylesheets[data.id].remove() if stylesheets[data.id]?
        
    server: {}
```

## License

(The MIT License)

Copyright &copy; 2011 [Lance Pollard](http://twitter.com/viatropos) &lt;lancejpollard@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
