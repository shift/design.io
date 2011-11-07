module.exports = (options) ->
  watch options.patterns, ->
    render: ->
      update: ->
        @jasmineEnv = window.jasmine.getEnv()
        @jasmineEnv.updateInterval = 1000
        webSocketReporter = new window.jasmine.WebSocketReporter(@)
        @jasmineEnv.addReporter(webSocketReporter)
        @jasmineEnv.specFilter = (spec) -> webSocketReporter.specFilter(spec)
        @jasmineEnv.execute()