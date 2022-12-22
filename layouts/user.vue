<template>
  <div class="flex min-h-screen mx-auto bg-ink-400 text-vanilla-100">
    <sidebar />
    <div class="w-full">
      <mobile-nav
        class="sticky top-0 z-30 w-full h-10 border-b lg:hidden bg-ink-300 border-slate-400"
      />
      <user-header class="z-10 w-full md:sticky md:top-10 lg:top-0" />
      <Nuxt />
    </div>
    <!-- remove this later and inject via zeal -->
    <portal-target name="modal" class="z-1000" @change="modalToggled"></portal-target>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import { LoggedOutSidebar, MobileNav } from '@/components/Layout'
import { Sidebar } from '@/components/Layout/Sidebar'
import AuthMixin from '@/mixins/authMixin'
import PortalMixin from '@/mixins/portalMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

/**
 * Active user layout
 */
@Component({
  components: {
    Sidebar,
    LoggedOutSidebar,
    MobileNav
  },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2 hide-scroll'
    }
  }
})
export default class UserLayout extends mixins(AuthMixin, PortalMixin, ActiveUserMixin) {
  /**
   * Fetch the current active user
   *
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    this.fetchActiveUser()
  }

  /**
   * Reset scroll position on page navigation
   * @return {any}
   */
  @Watch('$route.path')
  resetScroll() {
    const divThatScrolls = this.$refs['scrolling-div'] as HTMLElement
    if (divThatScrolls) divThatScrolls.scrollTop = 0
  }
}
</script>
