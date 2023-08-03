<template>
  <div class="space-y-1">
    <z-menu
      v-if="isCollapsed"
      v-tooltip="{ content: isCollapsed ? 'Recently active' : '', placement: 'right' }"
    >
      <template #trigger="{ toggle }">
        <button
          type="button"
          class="flex h-8 min-w-8 items-center justify-center space-x-2 rounded-sm py-1 text-sm outline-none hover:bg-ink-300 focus:outline-none"
          @click="toggle"
        >
          <z-icon icon="repositories" size="small" class="min-h-4 min-w-4" />
        </button>
      </template>

      <template #body="{ close }">
        <z-menu-section :divider="false">
          <z-menu-item
            v-for="repo in repoList"
            :key="repo.id"
            as="nuxt-link"
            :to="buildRoute(repo)"
            class="w-full"
            @click.native="close"
          >
            <div class="flex items-center space-x-2 leading-none">
              <z-icon
                :icon="repo.icon"
                size="small"
                :color="repo.isActive ? 'juniper' : ''"
                class="min-h-4 min-w-4"
              />
              <div class="text-sm">{{ repo.displayName }}</div>
            </div>
          </z-menu-item>
        </z-menu-section>
      </template>
    </z-menu>

    <template v-else>
      <button
        type="button"
        class="flex w-full items-center justify-between px-2 py-1 text-sm outline-none focus:outline-none"
        :class="[
          isActive && !(repoWithPendingAdhocRuns && repoWithPendingAdhocRuns.length)
            ? 'text-vanilla-100'
            : 'text-vanilla-400',
          { cursor: repoList.length === 0 }
        ]"
        @click.prevent="toggleDropdown"
      >
        <div class="flex items-center space-x-2">
          <z-icon icon="repositories" />
          <span>Recently active</span>
        </div>

        <z-tag bg-color="ink-100" text-size="xs" spacing="pl-2 pr-1.5 py-0.5">
          {{ repoList.length }}
          <z-icon class="pl-1" :icon="dropdownCollapsed ? 'chevron-up' : 'chevron-down'" />
        </z-tag>
      </button>
      <div v-show="dropdownCollapsed" class="space-y-0.5">
        <sidebar-item
          v-for="repo in repoList"
          :key="repo.id"
          :icon="repo.icon"
          :active="$route.params.repo === repo.name"
          :icon-color="repo.isActive ? 'juniper' : ''"
          class="pl-7"
          :to="buildRoute(repo)"
          :class="isCollapsed ? 'hidden' : 'block'"
        >
          {{ repo.displayName }}
        </sidebar-item>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Prop, mixins, Watch, Component } from 'nuxt-property-decorator'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import RepoListMixin from '~/mixins/repoListMixin'
import { Repository, RepositoryKindChoices } from '~/types/types'

@Component({})
export default class SidebarRecentlyActive extends mixins(ActiveUserMixin, RepoListMixin) {
  @Prop({ default: false })
  isCollapsed: boolean

  public dropdownCollapsed = false

  async fetch(): Promise<void> {
    await this.fetchActiveUser()
    await this.fetchRepos()
  }

  mounted() {
    this.$socket.$on('repo-onboarding-completed', () => {
      this.fetchRepos(true)
    })
    const { provider, owner } = this.$route.params

    this.dropdownCollapsed =
      (this.$localStore.get('ui-state', `is-sidebar-collapsed-${provider}-${owner}`) as boolean) ??
      true
  }

  beforeDestroy() {
    this.$socket.$off('repo-onboarding-completed')
  }

  async fetchRepos(refetch = false): Promise<void> {
    await this.fetchActiveAnalysisRepoList({
      login: this.activeOwner,
      provider: this.activeProvider,
      refetch
    })
  }

  @Watch('activeDashboardContext.id')
  refetchRepos(): void {
    this.fetchRepos(true).catch(() => {})
  }

  @Watch('dropdownCollapsed')
  updateLocalState(): void {
    const { provider, owner } = this.$route.params

    if (process.client)
      this.$localStore.set(
        'ui-state',
        `is-sidebar-collapsed-${provider}-${owner}`,
        this.dropdownCollapsed
      )
  }

  get repoList(): Array<Record<string, unknown>> {
    if (this.repoWithActiveAnalysis) {
      return this.repoWithActiveAnalysis.map(
        ({ id, displayName, isPrivate, kind, name, ownerLogin }) => {
          const icon = this.getIcon({ isPrivate, kind })

          return {
            id,
            displayName,
            name,
            owner: ownerLogin,
            icon,
            isActive: false
          }
        }
      )
    }
    return []
  }

  buildRoute(repo: Record<string, unknown>): string {
    return `/${this.activeProvider}/${repo.owner ?? this.activeOwner}/${repo.name}`
  }

  getIcon({ isPrivate, kind }: Pick<Repository, 'isPrivate' | 'kind'>): string {
    if (kind === RepositoryKindChoices.Subrepo) {
      return isPrivate ? 'folder-locked' : 'folder-globe'
    }

    return isPrivate ? 'z-lock' : 'globe'
  }

  toggleDropdown(): void {
    if (this.repoList.length > 0) {
      this.dropdownCollapsed = !this.dropdownCollapsed
    }
  }

  get isActive(): boolean {
    if (!this.$route.name) return false

    return (
      this.$route.name === 'provider-owner-repo' ||
      this.$route.name?.startsWith('provider-owner-repo-')
    )
  }

  public getRoute(params: string): string {
    return `/${this.activeProvider}/${this.activeOwner}/${params}`
  }
}
</script>
