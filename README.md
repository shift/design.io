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

``` coffeescript
watch ".styl", ".less", ".sass", ".css"
  create: (path) ->
    @update(path)
    
  update: (path) ->
    require('shift').renderFile path, (error, result) ->
      return @error(error) if error
      @emit path: path, body: result, id: @id(path)
  
  delete: (path) ->
    @emit id: @id(path)
  
  render:
    update: (data) ->
      stylesheets = @stylesheets ||= {}
      stylesheets[data.id].remove() if stylesheets[data.id]?
      node = $("<style id='#{data.id}' type='text/css'>#{data.body}</style>")
      stylesheets[data.id] = node
      $("body").append(node)
      
    destroy: (data) ->
      $("##{data.id}").remove()
```

### Reusable Extensions

``` coffeescript
Shift = require 'shift'

module.exports = (options) ->
  @watch options.extensions
    create: (path) ->
      @update(path)
    
    update: (path) ->
      Shift.renderFile path, (error, result) ->
        return @error(error) if error
        @emit path: path, body: result, id: @id(path)
  
    delete: (path) ->
      @emit id: @id(path)
  
    render:
      update: (data) ->
        stylesheets = @stylesheets ||= {}
        stylesheets[data.id].remove() if stylesheets[data.id]?
        node = $("<style id='#{data.id}' type='text/css'>#{data.body}</style>")
        stylesheets[data.id] = node
        $("body").append(node)
      
      destroy: (data) ->
        $("##{data.id}").remove()
```

## License

(The MIT License)

Copyright &copy; 2011 [Lance Pollard](http://twitter.com/viatropos) &lt;lancejpollard@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
