<template>
  <div>
    <section-header title="Projects" />

    <div v-if="$fetchState.pending" class="grid animate-pulse gap-4 md:w-2/3">
      <div v-for="ii in 5" :key="ii" class="h-32 rounded-md bg-ink-300"></div>
    </div>

    <div v-else-if="resolveNodes(watchedRepositories).length" class="grid gap-4 md:w-2/3">
      <discover-repo-card
        v-for="(edge, key) in watchedRepositories.edges"
        :key="key"
        :repo-info="edge.node"
        :show-description="true"
        :show-info="true"
      >
        <template v-if="edge.node && edge.node.modifiedAt" #stats>
          <z-icon icon="clock" size="x-small" color="vanilla-400" />
          <span class="text-sm text-vanilla-400">
            Updated {{ fromNow(edge.node.modifiedAt) }}
          </span>
        </template>
      </discover-repo-card>
    </div>
    <div v-else>
      <lazy-empty-state title="No projects found" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'

import { resolveNodes } from '@/utils/array'
import { fromNow } from '@/utils/date'
import { DiscoverUserActions, DiscoverUserGetters } from '~/store/discover/user'
import { RepositoryConnection } from '~/types/types'

const discoverUserStore = namespace('discover/user')

@Component({
  methods: { fromNow, resolveNodes }
})
export default class WatchedRepoFeed extends Vue {
  @discoverUserStore.Getter(DiscoverUserGetters.GET_WATCHED_REPOSITORIES)
  watchedRepositories: RepositoryConnection

  @discoverUserStore.Action(DiscoverUserActions.FETCH_WATCHED_REPOSITORIES)
  fetchWatchedRepositories: (args?: { refetch?: boolean }) => Promise<void>

  async fetch() {
    await this.fetchWatchedRepositories()
  }
}
</script>
