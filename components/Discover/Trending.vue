<template>
  <div>
    <section-header title="Trending" />

    <div v-if="$fetchState.pending" class="grid gap-4 animate-pulse">
      <div v-for="ii in 5" :key="ii" class="rounded-md h-17 bg-ink-300"></div>
    </div>

    <div v-else class="grid gap-4">
      <repo-card
        v-for="(edge, key) in trendingRepositories.edges"
        :key="key"
        :repo-info="edge.node"
        :show-description="false"
        :show-info="false"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { DiscoverRepoActions, DiscoverRepoGetters } from '~/store/discover/repositories'
import { Maybe, Repository, RepositoryConnection } from '~/types/types'

import RepoCard from './RepoCard.vue'

const discoverRepositoriesStore = namespace('discover/repositories')

@Component({
  components: {
    RepoCard
  }
})
export default class Trending extends Vue {
  @discoverRepositoriesStore.Getter(DiscoverRepoGetters.GET_EDITORS_PICK_REPOSITORY)
  editorsPickRepository: Maybe<Repository>

  @discoverRepositoriesStore.Getter(DiscoverRepoGetters.GET_TRENDING_REPOSITORIES)
  trendingRepositories: Maybe<RepositoryConnection>

  @discoverRepositoriesStore.Action(DiscoverRepoActions.FETCH_TRENDING_REPOSITORIES)
  fetchTrendingRepositories: (args?: { refetch?: boolean }) => Promise<void>

  async fetch() {
    await this.fetchTrendingRepositories()
  }
}
</script>
