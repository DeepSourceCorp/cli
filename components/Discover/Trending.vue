<template>
  <div>
    <section-header title="Trending" />

    <div v-if="$fetchState.pending" class="grid animate-pulse gap-4">
      <div v-for="ii in 5" :key="ii" class="h-17 rounded-md bg-ink-300"></div>
    </div>

    <div v-else class="grid gap-4">
      <discover-repo-card
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

const discoverRepositoriesStore = namespace('discover/repositories')

@Component({})
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
