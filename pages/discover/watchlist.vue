<template>
  <div class="pb-8">
    <div class="p-4 border-b border-ink-200">
      <z-breadcrumb separator="/" class="mb-px text-sm text-vanilla-100">
        <z-breadcrumb-item class="cursor-pointer text-vanilla-400">
          <nuxt-link to="/discover">Discover</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item>Watchlist</z-breadcrumb-item>
      </z-breadcrumb>
    </div>

    <hero-header
      title="Watchlist"
      class="watchlist-mobile-hero md:watchlist-hero"
      subtitle="Keep track of new issues in the projects you love and care about."
    />

    <!-- Layout for larger screens -->
    <div class="hidden gap-4 px-4 md:grid text-vanilla-100 grid-cols-discover">
      <!-- Discover repo feed -->
      <watched-repo-feed />
      <section class="space-y-4">
        <!-- Editor's pick repository -->
        <editors-pick />
        <!-- Trending repositories -->
        <trending />
      </section>
    </div>

    <!-- Mobile layout -->
    <div class="flex flex-col items-center md:hidden">
      <z-tabs class="w-full -mb-px">
        <div class="flex justify-between px-4 border-b border-ink-200">
          <z-tab-list class="flex pt-4 space-x-4 overflow-auto sm:w-auto hide-scroll">
            <z-tab-item class="flex items-center flex-shrink-0" icon="tachometer-fast">
              <span>Watchlist</span>
            </z-tab-item>
            <z-tab-item class="flex items-center flex-shrink-0" icon="trending-up">
              <span>Trending</span>
            </z-tab-item>
          </z-tab-list>
        </div>

        <z-tab-panes class="px-4 pt-4 min-h-48">
          <!-- Discover repo feed -->
          <watched-repo-feed />

          <z-tab-pane>
            <!-- Editor's pick repository -->
            <editors-pick class="mb-2" />
            <!-- Trending repositories -->
            <trending />
          </z-tab-pane>
        </z-tab-panes>
      </z-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import {
  ZIcon,
  ZButton,
  ZTabs,
  ZTabList,
  ZTabPane,
  ZTabPanes,
  ZTabItem,
  ZBreadcrumb,
  ZBreadcrumbItem
} from '@deepsourcelabs/zeal'
import EditorsPick from '@/components/Discover/EditorsPick.vue'
import Trending from '@/components/Discover/Trending.vue'
import { Context } from '@nuxt/types'

@Component({
  components: {
    ZIcon,
    ZButton,
    ZTabs,
    ZTabList,
    ZTabPane,
    ZTabPanes,
    ZTabItem,
    ZBreadcrumb,
    ZBreadcrumbItem,
    Trending,
    EditorsPick
  },
  middleware: [
    ({ redirect, store }: Context) => {
      const { loggedIn } = store.state.account.auth
      if (!loggedIn) {
        redirect('/discover')
      }
    }
  ],
  layout: 'discover'
})
export default class Watchlist extends Vue {
  head(): Record<string, string> {
    return {
      title: `Watchlist of your favourite open source projects`,
      description: 'Keep track of new issues in the projects you love and care about.'
    }
  }
}
</script>

<style scoped>
.watchlist-mobile-hero {
  background-image: url('~assets/images/discover/discover-mobile-bg.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

@responsive {
  .watchlist-hero {
    background-image: url('~assets/images/discover/watchlist-bg.svg');
    background-position: bottom;
    background-repeat: no-repeat;
    background-size: contain;
  }
}
</style>
