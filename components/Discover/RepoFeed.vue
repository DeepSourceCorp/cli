<template>
  <section>
    <section-header title="Recommended projects" />
    <div v-if="loading" class="grid gap-2 animate-pulse">
      <div v-for="ii in 5" :key="ii" class="h-32 rounded-md bg-ink-300" />
    </div>
    <div v-else-if="resolveNodes(discoverRepositories).length" class="grid gap-2">
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
      <lazy-empty-state title="No results found" />
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { ZDivider, ZIcon } from '@deepsourcelabs/zeal'

import { resolveNodes } from '@/utils/array'
import { fromNow } from '@/utils/date'
import { DiscoverRepoGetters } from '~/store/discover/repositories'
import { Maybe, RepositoryConnection } from '~/types/types'

import RepoCard from './RepoCard.vue'
import SectionHeader from './SectionHeader.vue'

const discoverRepositoriesStore = namespace('discover/repositories')

@Component({
  components: {
    RepoCard,
    SectionHeader,
    ZDivider,
    ZIcon
  }
})
export default class RepoFeed extends Vue {
  @Prop({ default: false })
  loading: boolean

  resolveNodes = resolveNodes
  fromNow = fromNow

  @discoverRepositoriesStore.Getter(DiscoverRepoGetters.GET_DISCOVER_REPOSITORIES)
  discoverRepositories: Maybe<RepositoryConnection>
}
</script>
