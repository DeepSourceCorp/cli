import { Middleware } from '@nuxt/types'
import { AuthGetterTypes } from '~/store/account/auth'
import { ActiveUserActions, ActiveUserGetterTypes } from '~/store/user/active'

const redirectToHome: Middleware = async ({ store, redirect }) => {
  if (store.getters[`account/auth/${AuthGetterTypes.GET_LOGGED_IN}`]) {
    try {
      await store.dispatch(`user/active/${ActiveUserActions.FETCH_VIEWER_INFO}`, { refetch: true })
      const homeURL = store.getters[`user/active/${ActiveUserGetterTypes.GET_HOME_URL}`]

      if (homeURL) {
        redirect(302, homeURL)
      }
    } catch (e) {}
  }
}

export default redirectToHome
