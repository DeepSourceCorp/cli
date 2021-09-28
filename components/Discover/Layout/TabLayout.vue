<template>
  <div class="flex flex-col items-center pt-4 md:hidden">
    <z-tabs class="w-full -mb-px">
      <div class="flex justify-between px-4 border-b border-ink-200">
        <z-tab-list
          class="flex justify-between w-full pt-4 space-x-4 overflow-auto sm:w-auto hide-scroll"
        >
          <z-tab-item class="flex items-center flex-shrink-0" icon="rss">
            <span> For you</span>
          </z-tab-item>
          <z-tab-item class="flex items-center flex-shrink-0" icon="clock">
            <span>Editor's pick</span>
          </z-tab-item>
          <z-tab-item class="flex items-center flex-shrink-0" icon="trending-up">
            <span>Trending</span>
          </z-tab-item>
        </z-tab-list>
      </div>

      <z-tab-panes class="px-4 pt-4 min-h-48">
        <!-- Discover repo feed -->
        <watched-repo-feed v-if="$route.path.includes('watchlist')" />
        <repo-feed v-else />

        <!-- Editor's pick repository -->
        <editors-pick />

        <!-- Trending repositories -->
        <trending />
      </z-tab-panes>
    </z-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ZIcon, ZInput, ZTabs, ZTabList, ZTabPane, ZTabPanes, ZTabItem } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon,
    ZInput,
    ZTabs,
    ZTabList,
    ZTabPane,
    ZTabPanes,
    ZTabItem
  }
})
export default class TabLayout extends Vue {}
</script>
