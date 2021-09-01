import { Middleware } from '@nuxt/types'
import { ContextActionTypes, ContextGetterTypes } from '~/store/account/context'
import { ActiveUserActions, ActiveUserGetterTypes } from '~/store/user/active'

const restrictOnboarding: Middleware = async ({ store, redirect }) => {
  try {
    await Promise.all([
      store.dispatch(`account/context/${ContextActionTypes.FETCH_CONTEXT}`, { refetch: true }),
      store.dispatch(`user/active/${ActiveUserActions.FETCH_VIEWER_INFO}`)
    ])
    const homePage = store.getters[`user/active/${ActiveUserGetterTypes.GET_HOME_URL}`]
    const toOnboard = store.getters[`account/context/${ContextGetterTypes.TO_ONBOARD}`]

    // Restrict onboarding if done already
    if (!toOnboard) {
      redirect(homePage)
    }
  } catch (e) {}
}

export default restrictOnboarding
