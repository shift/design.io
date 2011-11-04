# Design.io

> Node.js + Textmate + CSS3 = Photoshop

## Install

[Here's a video tutorial on vimeo](http://vimeo.com/31589739)

```
npm install design.io
```

## Example App for Design.io

First, make sure you have `design.io` installed:

```
npm install design.io
```

Then `cd` into the example project and start the basic node.js server:

```
git clone https://github.com/viatropos/design.io.git
cd design.io/example
npm install
node server.js
```

Finally, run the `design.io` command:

```
design.io --watch ./src
```

That `design.io --watch [directory]` command will watch a directory for changes and inject JavaScripts and StyleSheets into the LIVE example web app whenever you hit save.  It does it in a clean an optimized way.

So, edit the files in `./src` and watch the stuff in the page change in real time.

## License

(The MIT License)

Copyright &copy; 2011 [Lance Pollard](http://twitter.com/viatropos) &lt;lancejpollard@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
