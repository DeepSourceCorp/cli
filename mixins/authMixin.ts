import { Component, Vue, namespace } from 'nuxt-property-decorator'

import { AuthActionTypes } from '~/store/account/auth'

const authStore = namespace('account/auth')
@Component
export default class AuthMixin extends Vue {
  @authStore.State
  loggedIn: boolean

  @authStore.State
  authUrls: Record<string, string>

  @authStore.Action(AuthActionTypes.LOG_OUT)
  logOutUser: () => void

  @authStore.Action(AuthActionTypes.FETCH_AUTH_URLS)
  fetchAuthUrls: () => void
}
