<template>
  <div class="relative h-screen flex mx-auto overflow-hidden bg-ink-400 text-vanilla-100">
    <sidebar v-if="loggedIn" class="top-0 z-50" />
    <logged-out-sidebar v-else class="top-0 z-50" />
    <div class="w-full overflow-y-scroll hide-scroll">
      <mobile-nav
        class="sticky h-10 lg:hidden w-full top-0 z-30 bg-ink-300 border-b border-ink-200"
      ></mobile-nav>
      <repo-header :key="repository.id" class="w-full md:sticky top-10 lg:top-0 z-30"></repo-header>
      <!--
        if the repository is activated:
          - if there hasn't been at least one analysis: show the waiting state with an
            issue update listener with auto-reload
          - if there has been at least one analysis: show the dashboard, with an issue
            update listener without auto-reload
        else:
          - show the inactive repository empty state so the user can activate
            analysis on the repository
      -->

      <!-- If the repository is activated continue, else show activate repository CTA -->
      <template v-if="repository.isActivated || allowedOnBroken">
        <!--
            Show the route page if 
              the repo is already active and analyzed
              OR it's a page like settings or history which is always visible
              OR if the page is loading
          -->
        <div v-if="repository.name === $route.params.repo && repository.errorCode && !loading">
          <div
            class="bg-cherry bg-opacity-10 p-4 flex items-center space-x-2 border-b border-cherry border-opacity-20"
          >
            <p
              class="max-w-4xl text-cherry error-state"
              v-html="repository.renderedErrorMessage"
            ></p>
          </div>
        </div>
        <Nuxt class="z-20" v-if="isAnalyzed || allowedOnBroken || loading" />

        <!-- Check if the repository has been analyzed or no -->
        <div class="p-5" v-else-if="repository.errorCode">
          <repo-inactive
            v-if="repository.errorCode === 3001"
            :id="repository.id"
            :name="repository.name"
            :defaultBranchName="repository.defaultBranchName"
            @refetch="refetchData"
          />
          <repo-error v-else />
        </div>
        <div class="p-5" v-else>
          <repo-empty v-if="!repoHasCode" />
          <repo-timeout
            v-else-if="hasLastRunTimedOut"
            :id="repository.id"
            :name="repository.name"
            @refetch="refetchData"
          />
          <repo-waiting v-else />
        </div>
      </template>
      <!-- Showing repository activate CTA -->
      <div v-else class="p-5">
        <repo-inactive
          :id="repository.id"
          :name="repository.name"
          :defaultBranchName="repository.defaultBranchName"
          @refetch="refetchData"
        />
      </div>
    </div>
    <!-- remove this later and inject via zeal -->
    <portal-target class="z-1000" name="modal"></portal-target>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import { RepoHeader, MobileNav, LoggedOutSidebar } from '@/components/Layout'
import { Sidebar } from '@/components/Layout/Sidebar'
import { ZLabel } from '@deepsourcelabs/zeal'
import AuthMixin from '@/mixins/authMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import FullStoryMixin from '~/mixins/fullStoryMixin'

import {
  RepoEmpty,
  RepoError,
  RepoInactive,
  RepoTimeout,
  RepoWaiting
} from '~/components/RepoStates'
import { RunStatus } from '~/types/types'

@Component({
  components: {
    Sidebar,
    RepoHeader,
    LoggedOutSidebar,
    RepoEmpty,
    RepoError,
    RepoInactive,
    RepoTimeout,
    RepoWaiting,
    MobileNav,
    ZLabel
  },
  middleware: ['hidePrivateRepo'],
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2'
    }
  }
})
export default class RepositoryLayout extends mixins(AuthMixin, RepoDetailMixin, FullStoryMixin) {
  public loading = false
  async fetch(): Promise<void> {
    this.loading = true
    try {
      await this.fetchBasicRepoDetails(this.baseRouteParams)
    } catch (e) {
      this.$toast.danger('There was a problem loading this repository')
    }
    this.loading = false
  }

  refetchData(): Promise<void> {
    return this.fetchBasicRepoDetails({
      ...this.baseRouteParams,
      refetch: true
    })
  }

  mounted(): void {
    this.$socket.$on('repo-analysis-updated', this.refetchData)
    this.$socket.$on('autofix-installation-complete', this.refetchData)
  }

  beforeDestroy(): void {
    this.$socket.$off('repo-analysis-updated', this.refetchData)
    this.$socket.$on('autofix-installation-complete', this.refetchData)
  }

  @Watch('$route.params.repo')
  removeRefetchEvents(): void {
    this.$root.$off('refetchCheck')
  }

  get isAnalyzed(): boolean {
    return this.repository.latestAnalysisRun !== null
  }

  get repoHasCode(): boolean {
    return Boolean(this.repository.defaultBranchName)
  }

  get hasLastRunTimedOut(): boolean {
    return this.repository?.lastRun?.status === RunStatus.Timo
  }

  get allowedOnBroken(): boolean {
    const allowedRoutes = [
      'provider-owner-repo-settings',
      'provider-owner-repo-generate-config',
      'provider-owner-repo-history',
      'provider-owner-repo-transform',
      'provider-owner-repo-run'
    ]
    const matchResults = allowedRoutes.map((name) => {
      if (this.$route.name) {
        return this.$route.name.startsWith(name)
      }
      return false
    })

    return matchResults.indexOf(true) > -1 ? true : false
  }
}
</script>
