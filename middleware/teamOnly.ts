import { Middleware } from '@nuxt/types'
import { DashboardContext } from '~/mixins/activeUserMixin'
import { ActiveUserActions } from '~/store/user/active'
import { User } from '~/types/types'

const passList = ['login', 'signup', 'github', 'bitbucket', 'gitlab']

const teamOnlyMiddleware: Middleware = async ({ store, route, redirect }) => {
  // Check passlist
  if (route.name && passList.includes(route.name)) {
    return
  }

  await store.dispatch(`user/active/${ActiveUserActions.FETCH_VIEWER_INFO}`)
  const viewer = store.state.user.active.viewer as User

  const { owner, provider } = route.params

  if (viewer.dashboardContext && owner && provider) {
    const activeContext = viewer.dashboardContext.filter((context: DashboardContext) => {
      return context.vcs_provider === provider && context.login === owner
    })

    if (activeContext.length >= 1) {
      const context = activeContext[0] as DashboardContext
      if (context.type === 'user') {
        redirect(302, `/${String(provider)}/${String(owner)}`)
      }
    }
  }
}

export default teamOnlyMiddleware
