import { Middleware } from '@nuxt/types'
import { ActiveUserActions } from '~/store/user/active'
import { User } from '~/types/types'

const passList = ['login', 'signup', 'github', 'bitbucket', 'gitlab']

/**
 * Middleware to block routes for non-beta users
 * ! note: returns early for onPrem users
 */
const betaUserMiddleware: Middleware = async ({ store, route, error, $config }) => {
  if ($config.onPrem) {
    return
  }

  // Check passlist
  if (route.name && passList.includes(route.name)) {
    return
  }

  await store.dispatch(`user/active/${ActiveUserActions.FETCH_VIEWER_INFO}`)
  const viewer = store.state.user.active.viewer as User

  if (!viewer.isBetaTester) error({ statusCode: 404 })
}

export default betaUserMiddleware
