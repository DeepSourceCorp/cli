import { Context, Inject } from '@nuxt/types/app'

import posthog from 'posthog-js'
import Vue from 'vue'
import { AuthGetterTypes } from '~/store/account/auth'
import { ActiveUserActions, ActiveUserGetterTypes } from '~/store/user/active'

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

declare module 'vuex/types/index' {
  interface Store<S> {
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
    store,
    app: { router }
  } = context

  /**
   * Helper to invoke the Vuex action aimed at fetching viewer information
   * @returns {Promise<Object>}
   */
  const getViewerInfo = async () => {
    if (store.getters[`account/auth/${AuthGetterTypes.GET_LOGGED_IN}`]) {
      try {
        await store.dispatch(`user/active/${ActiveUserActions.FETCH_VIEWER_INFO}`)
        const viewerInfo = store.getters[`user/active/${ActiveUserGetterTypes.GET_VIEWER}`]
        return viewerInfo
      } catch (e) {
        return {}
      }
    }
  }

  // Initialize PostHog
  const { posthogApiKey, posthogApiHost } = $config
  if (posthogApiKey && posthogApiHost) {
    posthog.init(posthogApiKey, {
      api_host: posthogApiHost,
      loaded: async function (ph) {
        const viewer = await getViewerInfo()
        if (viewer && Object.keys(viewer).length) {
          const { id, email, fullName, dateJoined } = viewer
          const parsedId = atob(id).replace('User:', '')
          ph.identify(parsedId, { email, fullName, createdAt: dateJoined })
        }
      }
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
