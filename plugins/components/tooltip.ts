import Vue from 'vue'
import VTooltip from 'v-tooltip'

// https://github.com/Akryum/v-tooltip#global-options

const options = {
  defaultTemplate: '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>',
  defaultOffset: 5,
  defaultDelay: 1000,
  defaultTrigger: 'hover',
  defaultLoadingClass: 'tooltip-loading',
  defaultLoadingContent: '...',
  disposeTimeout: 0,
  autoHide: true
}

Vue.use(VTooltip, options)
