import { Context, Inject } from '@nuxt/types/app'
import * as rudderAnalytics from 'rudder-sdk-js'

declare module 'vue/types/vue' {
  interface Vue {
    $rudder: typeof rudderAnalytics
  }
}

declare module '@nuxt/types' {
  interface Context {
    $rudder: typeof rudderAnalytics
  }
}

/**
 * Implement Rudder JS SDK as a Nuxt.js plugin
 *
 * @param {Context} context
 * @param {Inject} inject
 * @returns {void}
 */
export default (context: Context, inject: Inject): void => {
  const { $config } = context

  inject('rudder', rudderAnalytics)

  if ($config.rudderWriteKey && $config.rudderDataPlaneUrl) {
    rudderAnalytics.load($config.rudderWriteKey, $config.rudderDataPlaneUrl)
  }
}
