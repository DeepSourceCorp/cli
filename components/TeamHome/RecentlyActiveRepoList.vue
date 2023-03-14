<template>
  <list-section title="Recently active repositories">
    <template v-if="canActivateRepo" slot="controls">
      <div class="hidden text-right md:block">
        <z-button
          v-tooltip="'Activate new repository'"
          button-type="ghost"
          icon="plus"
          size="small"
          color="vanilla-400"
          @click="showAddRepoModal = true"
        />
        <add-repo-modal :show-modal="showAddRepoModal" @close="showAddRepoModal = false" />
      </div>
    </template>
    <template v-if="repoListLoading">
      <div
        v-for="idx in loaderCount"
        :key="idx"
        class="flex w-full h-12 px-4 py-3 space-x-3 border-b border-slate-400 last:border-none"
      >
        <div class="w-5 h-full rounded-md bg-ink-300 animate-pulse"></div>
        <div class="w-1/4 h-full rounded-md bg-ink-300 animate-pulse"></div>
        <div class="w-1/6 h-full rounded-md bg-ink-300 animate-pulse"></div>
        <div class="flex-grow"></div>
        <div class="w-1/5 h-full rounded-md bg-ink-300 animate-pulse"></div>
      </div>
    </template>
    <template
      v-else-if="
        Array.isArray(repoWithActiveAnalysisWithAnalyzers) &&
        repoWithActiveAnalysisWithAnalyzers.length
      "
    >
      <list-item
        v-for="repo in repoWithActiveAnalysisWithAnalyzers"
        :key="repo.id"
        :to="generateLink(repo)"
        :icon="repo.isPrivate ? 'z-lock' : 'globe'"
        class="px-4 py-3"
      >
        <template slot="label">
          <div class="flex items-center space-x-3">
            <span>
              {{ repo.name }}
            </span>
            <span
              v-if="repo.availableAnalyzers && repo.availableAnalyzers.edges"
              class="hidden space-x-3 xs:flex"
            >
              <template v-for="edge in repo.availableAnalyzers.edges">
                <analyzer-logo v-if="edge && edge.node" :key="edge.node.name" v-bind="edge.node" />
              </template>
            </span>
          </div>
        </template>
        <template slot="info">
          <span v-tooltip="formatDate(repo.lastAnalyzedAt, 'lll')">{{
            repo.lastAnalyzedAt ? getHumanizedTimeFromNow(repo.lastAnalyzedAt) : ''
          }}</span>
        </template>
      </list-item>
    </template>
    <empty-state v-else :use-v2="true" title="No active repositories found">
      <span v-if="canActivateRepo" slot="subtitle">
        No repositories activated, generate a new config or activate a repository directly if a
        <code class="font-medium text-vanilla-200">.deepsource.toml</code> already exists.
      </span>
      <span v-else slot="subtitle">
        Please get in touch with the owner of your organization to activate analysis for a
        repository.
      </span>
      <z-button
        slot="action"
        icon="plus"
        size="small"
        label="Activate new repository"
        @click="showAddRepoModal = true"
      />
    </empty-state>
  </list-section>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsource/zeal'
import { getHumanizedTimeFromNow, formatDate } from '@/utils/date'
import { AddRepoModal } from '@/components/AddRepo'
import AnalyzerLogo from '@/components/AnalyzerLogo.vue'

// types
import { TeamMemberRoleChoices, Repository } from '~/types/types'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import RepoListMixin from '~/mixins/repoListMixin'
import { TeamPerms } from '~/types/permTypes'

@Component({
  components: { ZButton, ZIcon, AddRepoModal, AnalyzerLogo },
  methods: { getHumanizedTimeFromNow, formatDate }
})
export default class RecentlyActiveRepoList extends mixins(ActiveUserMixin, RepoListMixin) {
  public repoListLoading = false
  public showAddRepoModal = false

  get canActivateRepo(): boolean {
    const role = this.activeDashboardContext.role as TeamMemberRoleChoices
    return this.$gateKeeper.team(TeamPerms.ACTIVATE_ANALYSIS, role)
  }

  async fetch(): Promise<void> {
    this.repoListLoading = true
    const { provider, owner } = this.$route.params

    await this.fetchActiveAnalysisRepoListWithAnalyzers({
      login: this.$route.params.owner,
      provider: this.$route.params.provider,
      limit: 10
    })

    if (process.client)
      this.$localStore.set(
        `${provider}-${owner}`,
        'recently-active-repo-count',
        this.repoWithActiveAnalysisWithAnalyzers?.length ?? 0
      )
    this.repoListLoading = false
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
