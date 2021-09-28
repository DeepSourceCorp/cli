<template>
  <div :class="{ 'md:mt-4': editorsPickRepository.fullName }">
    <section-header title="Trending" />

    <loading v-if="$fetchState.pending" />

    <div v-else class="grid gap-2">
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
