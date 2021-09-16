import Vue from 'vue'
import ini from 'highlight.js/lib/languages/ini'
import json from 'highlight.js/lib/languages/json'
import hljs from 'highlight.js/lib/core'

hljs.registerLanguage('toml', ini)
hljs.registerLanguage('json', json)

Vue.use(hljs.vuePlugin)
