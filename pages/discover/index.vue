<template>
  <div class="pb-8">
    <div
      class="flex flex-col items-center md:flex-row md:items-baseline min-h-56 md:min-h-64 discover-mobile-hero md:discover-hero"
    >
      <div class="px-4 my-10 text-center md:mt-10 md:mb-0 md:text-left">
        <h1
          class="text-2xl font-bold leading-none md:text-3xl discover-mobile-hero-text md:bg-none"
        >
          Discover
        </h1>
        <p class="max-w-lg mt-3 text-md md:max-w-2xl md:text-lg text-vanilla-400">
          Discover and fix bug risks, anti-patterns, performance issues and security flaws.
        </p>
        <z-input
          size="large"
          placeholder="Search for a repository, technology, or by language"
          background-color="ink-300"
          v-model="searchTerm"
          :show-border="false"
          :name="searchTerm"
          class="mt-6 rounded-md shadow-lg"
          @debounceInput="searchRepo"
        >
          <z-icon icon="search" size="base" color="vanilla-400" class="ml-3 mr-1" slot="left" />
        </z-input>
      </div>
    </div>

    <!-- Layout for larger screens -->
    <grid-layout />

    <!-- Mobile layout -->
    <tab-layout />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { ZIcon, ZInput } from '@deepsourcelabs/zeal'

import { DiscoverRepoActions } from '~/store/discover/repositories'

const discoverRepositoriesStore = namespace('discover/repositories')

@Component({
  components: {
    ZInput,
    ZIcon
  },
  layout: 'sidebar-only'
})
export default class Discover extends Vue {
  searchTerm = ''

  @discoverRepositoriesStore.Action(DiscoverRepoActions.FETCH_DISCOVER_REPOSITORIES)
  fetchDiscoverRepositories: (args?: { q: string; refetch?: boolean }) => Promise<void>

  async searchRepo() {
    await this.fetchDiscoverRepositories({ q: this.searchTerm })
  }
}
</script>

<style scoped>
.discover-mobile-hero {
  background-image: linear-gradient(rgba(22, 24, 29, 0), rgba(22, 24, 29, 0.9)),
    url('~assets/images/discover/discover-mobile-bg.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.discover-mobile-hero-text {
  background: -webkit-linear-gradient(#7a96f2, #ce79d1);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@screen md {
  .discover-mobile-hero-text {
    background: #fff;
    background-clip: text;
    -webkit-background-clip: text;
  }
}

@responsive {
  .discover-hero {
    background-image: linear-gradient(rgba(22, 24, 29, 0), rgba(22, 24, 29, 0.9)),
      url('~assets/images/discover/discover-bg.svg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }
}
</style>
