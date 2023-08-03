<template>
  <list-section title="Recently active repositories">
    <template v-if="canActivateRepo" #controls>
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
        class="flex h-12 w-full space-x-3 border-b border-slate-400 px-4 py-3 last:border-none"
      >
        <div class="h-full w-5 animate-pulse rounded-md bg-ink-300"></div>
        <div class="h-full w-1/4 animate-pulse rounded-md bg-ink-300"></div>
        <div class="h-full w-1/6 animate-pulse rounded-md bg-ink-300"></div>
        <div class="flex-grow"></div>
        <div class="h-full w-1/5 animate-pulse rounded-md bg-ink-300"></div>
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
        :icon="getIcon(repo)"
        class="px-4 py-3"
      >
        <template #label>
          <div class="flex items-center gap-x-3 truncate">
            <span>
              {{ repo.displayName }}
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
        <template #info>
          <span v-tooltip="formatDate(repo.lastAnalyzedAt, 'lll')">{{
            repo.lastAnalyzedAt ? getHumanizedTimeFromNow(repo.lastAnalyzedAt) : ''
          }}</span>
        </template>
      </list-item>
    </template>
    <empty-state v-else :use-v2="true" title="No active repositories found">
      <template #subtitle>
        <span v-if="canActivateRepo">
          No repositories activated, generate a new config or activate a repository directly if a
          <code class="font-medium text-vanilla-200">.deepsource.toml</code> already exists.
        </span>

        <span v-else>
          Please get in touch with the owner of your organization to activate analysis for a
          repository.
        </span>
      </template>

      <template #action>
        <z-button
          icon="plus"
          size="small"
          label="Activate new repository"
          @click="showAddRepoModal = true"
        />
      </template>
    </empty-state>
  </list-section>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { getHumanizedTimeFromNow, formatDate } from '@/utils/date'

// types
import { TeamMemberRoleChoices, Repository, RepositoryKindChoices } from '~/types/types'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import RepoListMixin from '~/mixins/repoListMixin'
import { TeamPerms } from '~/types/permTypes'

@Component({
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
      provider: this.$route.params.provider
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

  getIcon({ isPrivate, kind }: Repository): string {
    if (kind === RepositoryKindChoices.Subrepo) {
      return isPrivate ? 'folder-locked' : 'folder-globe'
    }

    return isPrivate ? 'z-lock' : 'globe'
  }
}
</script>
