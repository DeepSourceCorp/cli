<template>
  <div class="h-screen relative flex mx-auto overflow-hidden bg-ink-400 text-vanilla-100">
    <sidebar v-if="loggedIn" class="top-0 z-50" />
    <logged-out-sidebar v-else class="top-0 z-50" />
    <div class="w-full overflow-y-scroll hide-scroll">
      <mobile-nav
        class="sticky h-10 lg:hidden w-full top-0 z-30 bg-ink-300 border-b border-ink-200"
      ></mobile-nav>
      <dashboard-header class="w-full lg:mt-0 md:sticky md:top-0 z-10"></dashboard-header>
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
import FullStoryMixin from '~/mixins/fullStoryMixin'

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
export default class DashboardLayout extends mixins(AuthMixin, FullStoryMixin) {}
</script>
