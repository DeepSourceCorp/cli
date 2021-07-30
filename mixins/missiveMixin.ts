import { Component, mixins, Watch } from 'nuxt-property-decorator'
import ActiveUserMixin from '~/mixins/activeUserMixin'

declare global {
  interface Window {
    MissiveChat: {
      setUser: (user: Record<string, unknown>) => void
      setMeta: (meta: Record<string, unknown>) => void
      show: () => void
      hide: () => void
    }
  }
}

@Component
export default class MissiveMixin extends mixins(ActiveUserMixin) {
  // Disabling the integration, since we plan
  // to phase out live support in favor of email support.
  // mounted(): void {
  // this.setMissiveViewer()
  // this.setMissiveMeta()
  // }

  @Watch('viewer')
  setMissiveViewer(): void {
    if (window.MissiveChat && this.viewer) {
      window.MissiveChat.setUser({
        name: this.viewer.fullName,
        email: this.viewer.email,
        digest: this.viewer.missiveUserHash,
        avatarUrl: this.viewer.avatar
      })
    }
  }

  @Watch('$route')
  setMissiveMeta(): void {
    if (window.MissiveChat) {
      window.MissiveChat.setMeta({
        path: this.$route.path
      })
    }
  }
}
