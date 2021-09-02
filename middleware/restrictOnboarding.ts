import { Middleware } from '@nuxt/types'
import { OwnerDetailActions, OwnerDetailGetters } from '~/store/owner/detail'
import { ActiveUserActions, ActiveUserGetterTypes } from '~/store/user/active'

const restrictOnboarding: Middleware = async ({ store, redirect, route }) => {
  try {
    const { login, provider } = route.params

    await Promise.all([
      store.dispatch(`owner/detail/${OwnerDetailActions.FETCH_OWNER_DETAILS}`, { login, provider }),
      store.dispatch(`user/active/${ActiveUserActions.FETCH_VIEWER_INFO}`)
    ])

    const canOnboard = store.getters[`owner/detail/${OwnerDetailGetters.CAN_ONBOARD}`]
    const homePage = store.getters[`user/active/${ActiveUserGetterTypes.GET_HOME_URL}`]

    // Restrict onboarding if done already
    if (!canOnboard) {
      redirect(homePage)
    }
  } catch (e) {}
}

export default restrictOnboarding
