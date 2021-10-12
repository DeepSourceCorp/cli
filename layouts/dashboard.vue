<template>
  <div class="relative flex h-screen mx-auto overflow-hidden bg-ink-400 text-vanilla-100">
    <sidebar v-if="loggedIn" class="top-0 z-50" />
    <logged-out-sidebar v-else class="top-0 z-50" />
    <div class="w-full overflow-y-scroll hide-scroll">
      <mobile-nav
        class="sticky top-0 z-30 w-full h-10 border-b lg:hidden bg-ink-300 border-ink-200"
      ></mobile-nav>
      <dashboard-header class="z-10 w-full lg:mt-0 md:sticky md:top-0"></dashboard-header>
      <Nuxt class="z-20" />
    </div>
    <!-- remove this later and inject via zeal -->
    <portal-target class="z-1000" name="modal"></portal-target>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { DashboardHeader, LoggedOutSidebar, MobileNav } from '@/components/Layout'
import { Sidebar } from '@/components/Layout/Sidebar'
import AuthMixin from '@/mixins/authMixin'

@Component({
  components: {
    Sidebar,
    DashboardHeader,
    LoggedOutSidebar,
    MobileNav
  },
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2'
    }
  }
})
export default class DashboardLayout extends mixins(AuthMixin) {}
</script>
