<template>
  <list-section title="Recently active repositories">
    <template slot="controls">
      <div class="text-right hidden md:block">
        <z-button
          v-tooltip="'Activate new repository'"
          buttonType="ghost"
          icon="plus"
          size="small"
          color="vanilla-400"
          @click="showAddRepoModal = true"
        ></z-button>
        <add-repo-modal :showModal="showAddRepoModal" @close="showAddRepoModal = false" />
      </div>
    </template>
    <template v-if="loading">
      <div
        v-for="idx in loaderCount"
        :key="idx"
        class="h-12 w-full px-4 py-3 border-b border-ink-300 last:border-none flex space-x-3"
      >
        <div class="h-full rounded-md bg-ink-300 animate-pulse w-5"></div>
        <div class="h-full rounded-md bg-ink-300 animate-pulse w-1/4"></div>
        <div class="h-full rounded-md bg-ink-300 animate-pulse w-1/6"></div>
        <div class="flex-grow"></div>
        <div class="h-full rounded-md bg-ink-300 animate-pulse w-1/5"></div>
      </div>
    </template>
    <template v-else-if="repoWithActiveAnalysis.edges.length">
      <list-item
        v-for="repo in repoWithActiveAnalysis.edges"
        :key="repo.node.id"
        :to="generateLink(repo.node)"
        :icon="repo.node.isPrivate ? 'lock' : 'globe'"
        class="px-4 py-3"
      >
        <template slot="label">
          <div class="flex items-center space-x-3">
            <span>
              {{ repo.node.name }}
            </span>
            <span
              v-if="repo.node.availableAnalyzers && repo.node.availableAnalyzers.edges"
              class="space-x-3 hidden xs:flex"
            >
              <analyzer-logo
                v-for="edge in repo.node.availableAnalyzers.edges"
                :key="edge.node.name"
                v-bind="edge.node"
              />
            </span>
          </div>
        </template>
        <template slot="info">
          <span v-tooltip="formatDate(repo.node.lastAnalyzedAt, 'lll')">{{
            repo.node.lastAnalyzedAt ? getHumanizedTimeFromNow(repo.node.lastAnalyzedAt) : ''
          }}</span>
        </template>
      </list-item>
    </template>
  </list-section>
</template>
<script lang="ts">
import { Vue, Component, namespace } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import { getHumanizedTimeFromNow, formatDate } from '@/utils/date'
import { AddRepoModal } from '@/components/AddRepo'
import AnalyzerLogo from '@/components/AnalyzerLogo.vue'

import { RepoListActions } from '~/store/repository/list'

// types
import { RepositoryConnection } from '~/types/types'

const repoListStore = namespace('repository/list')

@Component({
  components: { ZButton, ZIcon, AddRepoModal, AnalyzerLogo }
})
export default class RecentlyActiveRepoList extends Vue {
  @repoListStore.State
  repoWithActiveAnalysis: RepositoryConnection

  private loading: boolean = false
  private showAddRepoModal = false

  @repoListStore.Action(RepoListActions.FETCH_ACTIVE_ANALYSIS_REPOSITORY_LIST)
  fetchRepoList: (params: Record<string, string | number>) => Promise<void>

  async fetch(): Promise<void> {
    this.loading = true
    const { provider, owner } = this.$route.params

    await this.fetchRepoList({
      login: this.$route.params.owner,
      provider: this.$route.params.provider,
      limit: 10
    })

    this.$localStore.set(
      `${provider}-${owner}`,
      'recently-active-repo-count',
      this.repoWithActiveAnalysis.edges.length
    )
    this.loading = false
  }

  get loaderCount(): number {
    const { provider, owner } = this.$route.params
    let localCountFromStore
    if (process.client) {
      localCountFromStore = this.$localStore.get(
        `${provider}-${owner}`,
        'recently-active-repo-count'
      ) as number
    }
    return localCountFromStore ?? 10
  }

  private formatDate = formatDate

  private getHumanizedTimeFromNow = getHumanizedTimeFromNow

  generateLink({ vcsProvider, ownerLogin, name }: Record<string, string>): string {
    return ['', this.$providerMetaMap[vcsProvider].shortcode, ownerLogin, name].join('/')
  }
}
</script>
