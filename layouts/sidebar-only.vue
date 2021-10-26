<template>
  <div class="flex min-h-screen mx-auto bg-ink-400 text-vanilla-100">
    <!-- ? Discover page uses a different sidebar -->
    <sidebar v-if="loggedIn" />
    <logged-out-sidebar v-else />
    <div ref="scrolling-div" class="w-full">
      <mobile-nav
        class="sticky top-0 z-30 w-full h-10 border-b lg:hidden bg-ink-300 border-ink-200"
      />
      <Nuxt />
    </div>
    <!-- TODO remove this later and inject via zeal -->
    <portal-target class="z-1000" name="modal" @change="modalToggled"></portal-target>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import { LoggedOutSidebar, MobileNav } from '@/components/Layout'
import { Sidebar } from '@/components/Layout/Sidebar'
import AuthMixin from '@/mixins/authMixin'
import PortalMixin from '@/mixins/portalMixin'

@Component({
  components: {
    Sidebar,
    LoggedOutSidebar,
    MobileNav
  },
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2 hide-scroll'
    }
  }
})
export default class SidebarOnlyLayout extends mixins(AuthMixin, PortalMixin) {
  @Watch('$route.path')
  resetScroll() {
    const divThatScrolls = this.$refs['scrolling-div'] as HTMLElement
    if (divThatScrolls) divThatScrolls.scrollTop = 0
  }
}
</script>
