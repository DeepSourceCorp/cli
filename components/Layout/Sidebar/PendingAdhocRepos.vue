<template>
  <div v-if="repoWithPendingAdhocRuns && repoWithPendingAdhocRuns.length" class="space-y-1">
    <z-menu v-if="isCollapsed">
      <template #trigger="{ toggle }">
        <button
          type="button"
          class="flex h-8 min-w-8 items-center justify-center space-x-2 rounded-sm py-1 text-sm outline-none hover:bg-ink-300 focus:outline-none"
          @click="toggle"
        >
          <z-icon icon="plus-circle" size="small" class="min-h-4 min-w-4" />
        </button>
      </template>

      <template #body>
        <z-menu-section :divider="false">
          <nuxt-link
            v-for="repo in repoWithPendingAdhocRuns"
            :key="repo.id"
            :to="buildRoute(repo)"
            class="w-full"
          >
            <z-menu-item>
              <div class="flex items-center space-x-2 leading-none">
                <z-icon
                  :icon="repo.isPrivate ? 'z-lock' : 'globe'"
                  size="small"
                  class="min-h-4 min-w-4"
                />
                <div class="text-sm">{{ repo.name }}</div>
              </div>
            </z-menu-item>
          </nuxt-link>
        </z-menu-section>
      </template>
    </z-menu>

    <template v-else>
      <div class="flex items-center space-x-2 px-2 py-1 text-sm text-vanilla-400">
        <z-icon icon="plus-circle" />
        <span>Commit pending</span>
      </div>
      <sidebar-item
        v-for="repo in repoWithPendingAdhocRuns"
        :key="repo.id"
        :icon="repo.isPrivate ? 'z-lock' : 'globe'"
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

import ActiveUserMixin from '~/mixins/activeUserMixin'
import RepoListMixin from '~/mixins/repoListMixin'

/**
 * Sidebar component for repos that are in `PENDING` state post adhoc run.
 */
@Component({
  name: 'SidebarPendingAdhocRepos'
})
export default class SidebarPendingAdhocRepos extends mixins(ActiveUserMixin, RepoListMixin) {
  @Prop({ default: false })
  isCollapsed: boolean

  /**
   * Fetch hook for the component.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchActiveUser()
    await this.fetchRepos()
  }

  /**
   * Mounted hook for the component. Binds listener for `repo-onboarding-completed` socket event.
   *
   * @returns {void}
   */
  mounted(): void {
    this.$socket.$on('repo-onboarding-completed', () => {
      this.fetchRepos(true)
    })
  }

  /**
   * BeforeDestroy hook for the componenet. Unbinds listener for `repo-onboarding-completed` socket event.
   */
  beforeDestroy() {
    this.$socket.$off('repo-onboarding-completed')
  }

  /**
   * Fetches pending repos from adhoc runs.
   *
   * @param {boolean} refetch - Refetches data from `network` if `true` instead of relying on cache.
   * @returns {Promise<void>}
   */
  async fetchRepos(refetch?: boolean): Promise<void> {
    await this.fetchPendingAdHocRepoList({
      login: this.activeOwner,
      provider: this.activeProvider,
      refetch
    })
  }

  /**
   * Builds route for a given repository object.
   *
   * @param {Record<string,string>} repo - Repository object containing `owner` and `name`.
   * @returns {string} Path to the repo.
   */
  buildRoute(repo: Record<string, unknown>): string {
    return `/${this.activeProvider}/${repo.owner ?? this.activeOwner}/${repo.name}/issues`
  }
}
</script>
