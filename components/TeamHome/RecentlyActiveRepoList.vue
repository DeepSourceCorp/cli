<template>
  <list-section title="Recently active repositories">
    <template v-if="canActivateRepo" slot="controls">
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
      <template v-for="repo in repoWithActiveAnalysis.edges">
        <list-item
          v-if="repo && repo.node"
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
                <template v-for="edge in repo.node.availableAnalyzers.edges">
                  <analyzer-logo
                    v-if="edge && edge.node"
                    :key="edge.node.name"
                    v-bind="edge.node"
                  />
                </template>
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
    </template>
  </list-section>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import { getHumanizedTimeFromNow, formatDate } from '@/utils/date'
import { AddRepoModal } from '@/components/AddRepo'
import AnalyzerLogo from '@/components/AnalyzerLogo.vue'

// types
import { TeamMemberRoleChoices, Repository } from '~/types/types'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import RepoListMixin from '~/mixins/repoListMixin'
import { TeamPerms } from '../../types/permTypes'

@Component({
  components: { ZButton, ZIcon, AddRepoModal, AnalyzerLogo }
})
export default class RecentlyActiveRepoList extends mixins(ActiveUserMixin, RepoListMixin) {
  public loading = false
  public showAddRepoModal = false
  public formatDate = formatDate
  public getHumanizedTimeFromNow = getHumanizedTimeFromNow

  get canActivateRepo(): boolean {
    const role = this.activeDashboardContext.role as TeamMemberRoleChoices
    return this.$gateKeeper.team(TeamPerms.ACTIVATE_ANALYSIS, role)
  }

  async fetch(): Promise<void> {
    this.loading = true
    const { provider, owner } = this.$route.params

    await this.fetchActiveAnalysisRepoList({
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

  generateLink({ vcsProvider, ownerLogin, name }: Repository): string {
    return ['', this.$providerMetaMap[vcsProvider].shortcode, ownerLogin, name].join('/')
  }
}
</script>
