<template>
  <div class="space-y-1" v-if="repoWithPendingAdhocRuns && repoWithPendingAdhocRuns.length">
    <z-menu v-if="isCollapsed">
      <template slot="trigger">
        <div
          class="flex items-center justify-center space-x-2 text-sm hover:bg-ink-300 rounded-sm py-1 min-w-8 h-8"
        >
          <z-icon icon="activity" size="small" class="min-w-4 min-h-4"></z-icon>
        </div>
      </template>
      <template slot="body" class="z-10">
        <z-menu-section :divider="false">
          <nuxt-link
            v-for="repo in repoWithPendingAdhocRuns"
            :key="repo.id"
            :to="buildRoute(repo)"
            class="w-full"
          >
            <z-menu-item>
              <div class="flex space-x-2 leading-none items-center">
                <z-icon
                  :icon="repo.isPrivate ? 'lock' : 'globe'"
                  size="small"
                  class="min-w-4 min-h-4"
                ></z-icon>
                <div class="text-sm">{{ repo.name }}</div>
              </div>
            </z-menu-item>
          </nuxt-link>
        </z-menu-section>
      </template>
    </z-menu>
    <template v-else>
      <div class="flex items-center py-1 px-2 space-x-2 text-sm text-vanilla-400">
        <z-icon icon="plus-circle" />
        <span>Commit pending</span>
      </div>
      <sidebar-item
        v-for="repo in repoWithPendingAdhocRuns"
        :key="repo.id"
        :icon="repo.isPrivate ? 'lock' : 'globe'"
        :active="$route.params.repo === repo.name"
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
    await this.fetchPendingAdHocRepoList({
      login: this.activeOwner,
      provider: this.activeProvider,
      refetch,
    })
  }

  buildRoute(repo: Record<string, unknown>): string {
    return `/${this.activeProvider}/${repo.owner ?? this.activeOwner}/${repo.name}/issues`
  }

  public isActive(params: string): boolean {
    return this.$route.name?.startsWith(params) || false
  }

  public getRoute(params: string): string {
    return `/${this.activeProvider}/${this.activeOwner}/${params}`
  }
}
</script>
