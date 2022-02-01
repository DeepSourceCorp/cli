import { Context, Inject } from '@nuxt/types/app'

import posthog from 'posthog-js'
import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $posthog: typeof posthog
  }
}

declare module '@nuxt/types' {
  interface Context {
    $posthog: typeof posthog
  }
}

/**
 * Implement PostHog as a Nuxt.js plugin
 *
 * @param {Context} context
 * @param {Inject} inject
 * @returns {void}
 */
export default function (context: Context, inject: Inject): void {
  const {
    $config,
    app: { router }
  } = context

  // Initialize PostHog
  const { posthogApiKey, posthogApiHost } = $config
  if (posthogApiKey && posthogApiHost) {
    posthog.init(posthogApiKey, {
      api_host: posthogApiHost
    })

    // Inject PostHog lib
    inject('posthog', posthog)

    // Make sure that pageviews are captured with each route change
    router?.afterEach((to) => {
      Vue.nextTick(() => {
        posthog.capture('$pageview', {
          $current_url: to.fullPath
        })
      })
    })
  } else {
    inject('posthog', {
      identify() {
        return
      },
      reset() {
        return
      }
    })
  }
}
