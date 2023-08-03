<template>
  <div class="mx-auto flex min-h-screen bg-ink-400 text-vanilla-100">
    <!-- Discover page uses a different sidebar -->
    <discover-sidebar />
    <div ref="scrolling-div" class="w-full">
      <mobile-nav
        class="sticky top-0 z-30 h-10 w-full border-b border-slate-400 bg-ink-300 lg:hidden"
      />
      <Nuxt />
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
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import { MobileNav } from '@/components/Layout'
import { DiscoverSidebar } from '@/components/Discover/Layout'
import AuthMixin from '@/mixins/authMixin'
import PortalMixin from '@/mixins/portalMixin'
import PaletteMixin from '~/mixins/paletteMixin'

@Component({
  components: {
    DiscoverSidebar,
    MobileNav
  },
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2 hide-scroll'
    }
  }
})
export default class DiscoverLayout extends mixins(AuthMixin, PortalMixin, PaletteMixin) {
  @Watch('$route.path')
  resetScroll() {
    const divThatScrolls = this.$refs['scrolling-div'] as HTMLElement
    if (divThatScrolls) divThatScrolls.scrollTop = 0
  }
}
</script>
