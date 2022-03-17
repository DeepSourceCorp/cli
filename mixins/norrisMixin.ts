import { Component, mixins, Watch } from 'nuxt-property-decorator'
import AuthMixin from './authMixin'

@Component
export default class NorrisMixin extends mixins(AuthMixin) {
  @Watch('$route.name', { immediate: true })
  _toggleNorris(): void {
    if (this._currentRouteInBlockedList || !this.loggedIn) {
      this.$norris && this.$norris.hide()
    } else {
      this.$norris && this.$norris.show()
    }
  }

  beforeDestroy(): void {
    this.$norris && this.$norris.hide()
  }

  get _currentRouteInBlockedList(): boolean {
    if (this.$route) {
      const _blockedRoutes = ['login', 'onboard', 'signup']
      const { name = '' } = this.$route

      return _blockedRoutes.some((route) => {
        return name?.includes(route)
      })
    }

    return true
  }
}
