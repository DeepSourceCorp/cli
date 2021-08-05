import { Component, mixins } from 'nuxt-property-decorator'
import ActiveUserMixin from '~/mixins/activeUserMixin'

declare global {
  interface Window {
    FS: Record<string, Function>
  }
}

@Component
export default class FullStoryMixin extends mixins(ActiveUserMixin) {
  mounted(): void {
    if (window.FS && this.viewer && !this.$config.onPrem) {
      window.FS.identify(this.viewer.id, {
        displayName: this.viewer.fullName,
        email: this.viewer.email,
        reviewsWritten_int: 14
      })
    }
  }
}
