<template>
  <div class="space-y-1">
    <z-menu v-if="isCollapsed">
      <template v-slot:trigger="{ toggle }">
        <button
          type="button"
          class="flex items-center justify-center space-x-2 text-sm hover:bg-ink-300 rounded-sm py-1 min-w-8 h-8 outline-none focus:outline-none"
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
            <div class="flex space-x-2 leading-none items-center">
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
      <div
        class="flex items-center py-1 px-2 space-x-2 text-sm"
        :class="
          isActive('provider-owner-repo') ? 'text-vanilla-100 font-semibold' : 'text-vanilla-400'
        "
      >
        <z-icon icon="activity" />
        <span>Recently active</span>
      </div>
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
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZMenu, ZMenuItem, ZMenuSection } from '@deepsourcelabs/zeal'

import { RepositoryEdge, Maybe } from '~/types/types'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import RepoListMixin from '~/mixins/repoListMixin'

@Component({
  components: {
    ZIcon,
    ZButton,
    ZMenuItem,
    ZMenu,
    ZMenuSection
  }
})
export default class SidebarRecentlyActive extends mixins(ActiveUserMixin, RepoListMixin) {
  @Prop({ default: false })
  isCollapsed: boolean

  async fetch(): Promise<void> {
    await this.fetchActiveUser()
    await this.fetchRepos()
  }

  mounted() {
    this.$socket.$on('repo-onboarding-completed', () => {
      this.fetchRepos(true)
    })
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

  public isActive(params: string): boolean {
    return this.$route.name?.startsWith(params) || false
  }

  public getRoute(params: string): string {
    return `/${this.activeProvider}/${this.activeOwner}/${params}`
  }
}
</script>
