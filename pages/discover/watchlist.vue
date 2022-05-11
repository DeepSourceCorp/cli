<template>
  <div class="pb-8">
    <breadcrumb-container
      :links="[{ label: 'Discover', route: '/discover' }, { label: 'Watchlist' }]"
    />

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
import { Context } from '@nuxt/types'
import { Component, mixins } from 'nuxt-property-decorator'

import MetaMixin from '~/mixins/metaMixin'

@Component({
  middleware: [
    'disableDiscoverOnPrem',
    ({ redirect, store }: Context) => {
      const { loggedIn } = store.state.account.auth
      if (!loggedIn) {
        redirect('/discover')
      }
    }
  ],
  layout: 'discover'
})
export default class Watchlist extends mixins(MetaMixin) {
  metaTitle = 'Watchlist of your favourite open source projects'
  metaDescription = 'Keep track of new issues in the projects you love and care about.'
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
