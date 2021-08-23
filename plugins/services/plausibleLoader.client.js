export default ({ $config, app }) => {
  if (!$config.onPrem) {
    app.head.script.push({
      src: 'https://gullfoss.deepsource.io/js/index.js',
      async: true,
      'data-domain': 'deepsource.io'
    })
  }
}
