<template>
  <div>
    <div class="watchlist-mobile-hero md:watchlist-hero">
      <div>
        <div class="mt-3.5 ml-3">
          <span class="font-semibold">
            <span class="text-vanilla-400">Discover</span
            ><span class="text-vanilla-100"> / Watchlist</span>
          </span>
        </div>
      </div>

      <div class="mt-3">
        <hr class="flex-grow border-ink-300" />
      </div>

      <div class="flex min-h-22">
        <nuxt-link to="/discover">
          <z-button
            class="mt-5 ml-3 leading-none border rounded-sm bg-ink-300 border-ink-200 hover:bg-ink-200"
          >
            <z-icon icon="arrow-left" size="small" color="vanilla-400" class="min-w-4 min-h-4" />
            <span class="text-sm font-medium text-vanilla-100"> Back to discover </span>
          </z-button>
        </nuxt-link>
      </div>
    </div>

    <!-- Layout for larger screens -->
    <grid-layout />

    <!-- Mobile layout -->
    <tab-layout />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZInput } from '@deepsourcelabs/zeal'
import { Context } from '@nuxt/types'

@Component({
  components: {
    ZButton,
    ZInput,
    ZIcon
  },
  middleware: [
    ({ redirect, store }: Context) => {
      const { loggedIn } = store.state.account.auth
      if (!loggedIn) {
        redirect('/discover')
      }
    }
  ],
  layout: 'sidebar-only'
})
export default class Watchlist extends Vue {}
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
