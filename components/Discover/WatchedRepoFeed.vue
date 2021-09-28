<template>
  <div>
    <section-header title="Projects on your watchlist" />

    <div v-if="$fetchState.pending" class="grid gap-2 animate-pulse">
      <div v-for="ii in 5" :key="ii" class="h-32 rounded-md bg-ink-300"/>
    </div>

    <div v-else-if="resolveNodes(watchedRepositories).length" class="mt-1.5 grid gap-2">
      <repo-card
        v-for="(edge, key) in watchedRepositories.edges"
        :key="key"
        :repo-info="edge.node"
        :show-description="true"
        :show-info="true"
        class="mt-2.5"
      >
        <template slot="stats" v-if="edge.node && edge.node.modifiedAt">
          <z-icon icon="clock" size="x-small" color="vanilla-400" />
          <span class="text-sm text-vanilla-400">
            Updated {{ fromNow(edge.node.modifiedAt) }}
          </span>
        </template>
      </repo-card>
    </div>
    <div v-else>
      <base-state title="No projects found">
        <template slot="hero">
          <img
            class="mx-auto mb-4"
            :src="require('~/assets/images/ui-states/repo/empty.svg')"
            alt="Empty feed"
          />
        </template>
      </base-state>
    </div>
  </div>
</template>

<script lang="ts">
import { ZIcon } from '@deepsourcelabs/zeal'
import { Component, namespace, Vue } from 'nuxt-property-decorator'

import { resolveNodes } from '@/utils/array'
import { fromNow } from '@/utils/date'
import { DiscoverUserActions, DiscoverUserGetters } from '~/store/discover/user'
import { RepositoryConnection } from '~/types/types'

import BaseState from '@/components/RepoStates/BaseState.vue'
import RepoCard from './RepoCard.vue'

const discoverUserStore = namespace('discover/user')

@Component({
  components: {
    BaseState,
    RepoCard,
    ZIcon
  }
})
export default class WatchedRepoFeed extends Vue {
  private fromNow = fromNow
  private resolveNodes = resolveNodes

  @discoverUserStore.Getter(DiscoverUserGetters.GET_WATCHED_REPOSITORIES)
  watchedRepositories: RepositoryConnection

  @discoverUserStore.Action(DiscoverUserActions.FETCH_WATCHED_REPOSITORIES)
  fetchWatchedRepositories: (args?: { refetch?: boolean }) => Promise<void>

  async fetch() {
    await this.fetchWatchedRepositories()
  }
}
</script>
