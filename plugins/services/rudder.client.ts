import { Context, Inject } from '@nuxt/types/app'
import * as rudderAnalytics from 'rudder-sdk-js'

import { DashboardContext } from '~/mixins/activeUserMixin'
import { AuthGetterTypes } from '~/store/account/auth'
import { ActiveUserActions, ActiveUserGetterTypes } from '~/store/user/active'

declare module 'vue/types/vue' {
  interface Vue {
    $rudder: typeof rudderAnalytics
  }
}

declare module 'vuex/types/index' {
  // skipcq: JS-0387, JS-0356
  interface Store<S> {
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
export default async (context: Context, inject: Inject): Promise<void> => {
  const { route, store, $config } = context

  const { rudderWriteKey, rudderDataPlaneUrl } = $config

  const isLoggedIn = store.getters[`account/auth/${AuthGetterTypes.GET_LOGGED_IN}`]

  if (!process.client || !rudderWriteKey || !rudderDataPlaneUrl) {
    return
  }

  /**
   * Helper to invoke the Vuex action aimed at fetching viewer information
   * @returns {Promise<User | undefined>}
   */
  const getViewerInfo = async () => {
    try {
      await store.dispatch(`user/active/${ActiveUserActions.FETCH_VIEWER_INFO}`)
      const viewerInfo = store.getters[`user/active/${ActiveUserGetterTypes.GET_VIEWER}`]
      return viewerInfo
    } catch (e) {
      return undefined
    }
  }

  inject('rudder', rudderAnalytics)

  rudderAnalytics.load($config.rudderWriteKey, $config.rudderDataPlaneUrl)

  // Return early if the user is not logged in
  if (!isLoggedIn) {
    return
  }

  const viewer = await getViewerInfo()
  if (viewer && Object.keys(viewer).length) {
    const {
      avatar,
      dateJoined: createdAt,
      dashboardContext,
      email,
      firstName,
      id,
      lastName
    } = viewer

    if (id && email) {
      const parsedId = Buffer.from(id, 'base64').toString().toLowerCase().replace('user:', '')

      rudderAnalytics.identify(parsedId, {
        avatar,
        createdAt,
        email,
        firstName,
        lastName
      })
    }

    const { provider, owner } = route.params

    const activeDashboardContext = dashboardContext
      // Invoke `$rudder.group` only for team accounts
      .find(({ login, type, vcs_provider }: DashboardContext) => {
        return type === 'team' && vcs_provider === provider && login === owner
      })

    // Identify the team via RudderStack
    if (activeDashboardContext && Object.keys(activeDashboardContext).length) {
      const {
        avatar_url: team_avatar_url,
        id: groupId,
        subscribed_plan_info,
        team_name,
        vcs_provider_display
      } = activeDashboardContext

      if (groupId && team_name) {
        rudderAnalytics.group(String(groupId), {
          avatar: team_avatar_url,
          name: team_name,
          plan:
            typeof subscribed_plan_info === 'object'
              ? subscribed_plan_info.name
              : subscribed_plan_info,
          vcsProvider: vcs_provider_display
        })
      }
    }
  }
}
