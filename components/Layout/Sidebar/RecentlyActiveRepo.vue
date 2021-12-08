<template>
  <div class="space-y-1">
    <z-menu
      v-if="isCollapsed"
      v-tooltip="{ content: isCollapsed ? 'Recently active' : '', placement: 'right' }"
    >
      <template v-slot:trigger="{ toggle }">
        <button
          type="button"
          class="
            flex
            items-center
            justify-center
            h-8
            py-1
            space-x-2
            text-sm
            rounded-sm
            outline-none
            hover:bg-ink-300
            min-w-8
            focus:outline-none
          "
          @click="toggle"
        >
          <z-icon icon="activity" size="small" class="min-w-4 min-h-4"></z-icon>
        </button>
      </template>
      <template v-slot:body="{ close }" class="z-10">
        <z-menu-section :divider="false">
          <z-menu-item
            v-for="repo in repoList"
            as="nuxt-link"
            :key="repo.id"
            :to="buildRoute(repo)"
            class="w-full"
            @click.native="close"
          >
            <div class="flex items-center space-x-2 leading-none">
              <z-icon
                :icon="repo.icon"
                size="small"
                :color="repo.isActive ? 'juniper' : ''"
                class="min-w-4 min-h-4"
              ></z-icon>
              <div class="text-sm">{{ repo.name }}</div>
            </div>
          </z-menu-item>
        </z-menu-section>
      </template>
    </z-menu>
    <template v-else>
      <button
        type="button"
        @click.prevent="toggleDropdown"
        class="
          flex
          items-center
          justify-between
          w-full
          px-2
          py-1
          text-sm
          outline-none
          focus:outline-none
        "
        :class="[
          isActive('provider-owner-repo') &&
          !(repoWithPendingAdhocRuns && repoWithPendingAdhocRuns.length)
            ? 'text-vanilla-100 font-semibold'
            : 'text-vanilla-400',
          { cursor: repoList.length === 0 }
        ]"
      >
        <div class="flex items-center space-x-2">
          <z-icon icon="activity" />
          <span>Recently active</span>
        </div>

        <z-tag bgColor="ink-100" textSize="xs" spacing="pl-2 pr-1.5 py-0.5">
          {{ repoList.length }}
          <z-icon class="pl-1" :icon="dropdownCollapsed ? 'chevron-up' : 'chevron-down'"></z-icon>
        </z-tag>
      </button>
      <transition
        :enter-active-class="$fetchState.pending ? '' : 'duration-300 ease-out'"
        :enter-class="$fetchState.pending ? '' : '-translate-y-full opacity-0'"
        :enter-to-class="$fetchState.pending ? '' : 'translate-y-0 opacity-100'"
        :leave-active-class="$fetchState.pending ? '' : 'duration-200 ease-in'"
        :leave-class="$fetchState.pending ? '' : 'translate-y-0 opacity-100'"
        :leave-to-class="$fetchState.pending ? '' : '-translate-y-full opacity-0'"
      >
        <div class="space-y-0.5" v-show="dropdownCollapsed">
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
            {{ repo.name }}
          </sidebar-item>
        </div>
      </transition>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Prop, mixins, Watch } from 'nuxt-property-decorator'
import { ZIcon, ZMenu, ZMenuItem, ZMenuSection, ZTag } from '@deepsourcelabs/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import RepoListMixin from '~/mixins/repoListMixin'

@Component({
  components: {
    ZIcon,
    ZMenuItem,
    ZMenu,
    ZMenuSection,
    ZTag
  }
})
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

    this.dropdownCollapsed = this.$localStore.get(
      'ui-state',
      `is-sidebar-collapsed-${provider}-${owner}`
    ) as boolean
  }

  beforeDestroy() {
    this.$socket.$off('repo-onboarding-completed')
  }

  async fetchRepos(refetch?: boolean): Promise<void> {
    await this.fetchActiveAnalysisRepoList({
      login: this.activeOwner,
      provider: this.activeProvider,
      limit: 10,
      refetch: refetch
    })
  }

  @Watch('activeDashboardContext.id')
  refetchRepos(): void {
    this.fetchRepos(true).catch(() => {})
  }

  @Watch('dropdownCollapsed')
  updateLocalState(): void {
    const { provider, owner } = this.$route.params

    this.$localStore.set(
      'ui-state',
      `is-sidebar-collapsed-${provider}-${owner}`,
      this.dropdownCollapsed
    )
  }

  get repoList(): Array<Record<string, unknown>> {
    if (this.repoWithActiveAnalysis) {
      return this.repoWithActiveAnalysis.map((repo) => {
        return {
          name: repo.name,
          id: repo.id,
          owner: repo.ownerLogin,
          icon: repo.isPrivate ? 'lock' : 'globe',
          isActive: false
        }
      })
    }
    return []
  }

  buildRoute(repo: Record<string, unknown>): string {
    return `/${this.activeProvider}/${repo.owner ?? this.activeOwner}/${repo.name}`
  }

  toggleDropdown(): void {
    if (this.repoList.length > 0) {
      this.dropdownCollapsed = !this.dropdownCollapsed
    }
  }

  public isActive(params: string): boolean {
    return this.$route.name?.startsWith(params) || false
  }

  public getRoute(params: string): string {
    return `/${this.activeProvider}/${this.activeOwner}/${params}`
  }
}
</script>
