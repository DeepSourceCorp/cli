<template>
  <div class="relative flex h-screen mx-auto overflow-hidden bg-ink-400 text-vanilla-100">
    <!-- Discover page uses a different sidebar -->
    <discover-sidebar class="top-0 z-50" />
    <div ref="scrolling-div" class="w-full overflow-y-scroll hide-scroll">
      <mobile-nav
        class="sticky top-0 z-30 w-full h-10 border-b lg:hidden bg-ink-300 border-ink-200"
      ></mobile-nav>
      <Nuxt class="z-20" />
    </div>
    <!-- remove this later and inject via zeal -->
    <portal-target class="z-1000" name="modal"></portal-target>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import { MobileNav } from '@/components/Layout'
import { DiscoverSidebar } from '@/components/Discover/Layout'
import AuthMixin from '@/mixins/authMixin'

@Component({
  components: {
    DiscoverSidebar,
    MobileNav
  },
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2'
    }
  }
})
export default class DiscoverLayout extends mixins(AuthMixin) {
  @Watch('$route.path')
  resetScroll() {
    const divThatScrolls = this.$refs['scrolling-div'] as HTMLElement
    if (divThatScrolls) divThatScrolls.scrollTop = 0
  }
}
</script>
