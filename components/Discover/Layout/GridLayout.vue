<template>
  <div class="hidden md:grid text-vanilla-100">
    <div class="grid gap-4 px-4 grid-cols-discover">
      <!-- Discover repo feed -->
      <div>
        <watched-repo-feed v-if="$route.path.includes('watchlist')" />
        <repo-feed v-else />
      </div>

      <!-- Editor's pick repository -->
      <div>
        <editors-pick />

        <!-- Trending repositories -->
        <trending />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ZIcon, ZInput } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon,
    ZInput
  }
})
export default class GridLayout extends Vue {}
</script>
