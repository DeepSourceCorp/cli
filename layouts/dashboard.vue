<template>
  <div class="flex min-h-screen mx-auto bg-ink-400 text-vanilla-100">
    <sidebar v-if="loggedIn" />
    <logged-out-sidebar v-else />
    <div class="w-full">
      <mobile-nav
        class="sticky top-0 z-30 w-full h-10 border-b lg:hidden bg-ink-300 border-ink-200"
      />
      <dashboard-header class="z-10 w-full md:sticky md:top-10 lg:top-0" />
      <Nuxt ref="page" />
    </div>
    <!-- remove this later and inject via zeal -->
    <portal-target class="z-1000" name="modal" @change="modalToggled"></portal-target>
    <client-only>
      <palette
        v-if="showPalette && allowPalette"
        @close="showPalette = false"
        @toggle="showPalette = !showPalette"
        class="z-1000"
      ></palette>
    </client-only>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { DashboardHeader, LoggedOutSidebar, MobileNav } from '~/components/Layout'
import { Sidebar } from '~/components/Layout/Sidebar'
import AuthMixin from '~/mixins/authMixin'
import PortalMixin from '~/mixins/portalMixin'
import PaletteMixin from '~/mixins/paletteMixin'

@Component({
  components: {
    Sidebar,
    DashboardHeader,
    LoggedOutSidebar,
    MobileNav
  },
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2 hide-scroll'
    }
  }
})
export default class DashboardLayout extends mixins(AuthMixin, PortalMixin, PaletteMixin) {}
</script>
