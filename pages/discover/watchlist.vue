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
    <div class="grid gap-4 px-4 mt-4 text-vanilla-100 md:mt-0">
      <!-- Discover repo feed -->
      <watched-repo-feed />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ZBreadcrumb, ZBreadcrumbItem } from '@deepsourcelabs/zeal'
import { Context } from '@nuxt/types'

@Component({
  components: {
    ZBreadcrumb,
    ZBreadcrumbItem
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
