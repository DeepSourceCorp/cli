<template>
  <div>
    <section-header title="Recommended projects" />

    <loading v-if="$fetchState.pending" />

    <div v-else>
      <div v-if="resolveNodes(discoverRepositories).length" class="grid gap-2">
        <repo-card
          v-for="edge in discoverRepositories.edges"
          :key="edge.node.id"
          :repo-info="edge.node"
          :show-description="true"
          :show-info="true"
        >
          <template slot="stats">
            <z-icon icon="clock" size="x-small" color="vanilla-400"></z-icon>
            <span class="text-sm text-vanilla-400">
              Updated {{ fromNow(edge.node.modifiedAt) }}
            </span>
          </template>
        </repo-card>
      </div>

      <div v-else>
        <base-state title="No results found">
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
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { ZDivider, ZIcon } from '@deepsourcelabs/zeal'

import { resolveNodes } from '@/utils/array'
import { fromNow } from '@/utils/date'
import { DiscoverRepoActions, DiscoverRepoGetters } from '~/store/discover/repositories'
import { Maybe, RepositoryConnection, Scalars } from '~/types/types'

import BaseState from '@/components/RepoStates/BaseState.vue'
import RepoCard from './RepoCard.vue'
import SectionHeader from './SectionHeader.vue'

const discoverRepositoriesStore = namespace('discover/repositories')

@Component({
  components: {
    BaseState,
    RepoCard,
    SectionHeader,
    ZDivider,
    ZIcon
  }
})
export default class RepoFeed extends Vue {
  private fromNow = fromNow
  private resolveNodes = resolveNodes

  @discoverRepositoriesStore.Getter(DiscoverRepoGetters.GET_DISCOVER_REPOSITORIES)
  discoverRepositories: Maybe<RepositoryConnection>

  @discoverRepositoriesStore.Action(DiscoverRepoActions.FETCH_DISCOVER_REPOSITORIES)
  fetchDiscoverRepositories: (args?: {
    name_Icontains?: string
    preferredTechnologies?: Array<Scalars['ID']>
    refetch?: boolean
  }) => Promise<void>

  async fetch() {
    await this.fetchDiscoverRepositories()
  }
}
</script>
