export default ({ $config, app }) => {
  if (!$config.onPrem) {
    app.head.script.push({
      src: `https://assets.deepsource.io/bifrost/muscox.min.js`,
      async: true,
      crossorigin: 'anonymous'
    })

    const rudderanalytics = (window.rudderanalytics = [])
    window.baseTrackingInfo = {}

    const methods = ['load', 'page', 'track', 'identify', 'alias', 'group', 'ready', 'reset']

    for (var i = 0; i < methods.length; i++) {
      var method = methods[i]
      rudderanalytics[method] = (function (methodName) {
        return function () {
          rudderanalytics.push([methodName].concat(Array.prototype.slice.call(arguments)))
        }
      })(method)
    }
    rudderanalytics.load('1dA3PPE2nqvVAu3BdF20oXSMxHj', 'https://muscox.deepsource.io')
    rudderanalytics.page()
  } else {
    window.rudderanalytics = null
  }
}
