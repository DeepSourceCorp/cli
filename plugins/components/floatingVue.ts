import Vue from 'vue'
import FloatingVue from 'floating-vue'

import 'floating-vue/dist/style.css'

const options = {
  themes: {
    'deepsource-dropdown': {
      $extend: 'dropdown',
      $resetCss: true,
      delay: {
        show: 0,
        hide: 0
      }
    }
  }
}

Vue.use(FloatingVue, options)
