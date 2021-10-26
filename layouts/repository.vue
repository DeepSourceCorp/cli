<template>
  <div class="flex min-h-screen mx-auto bg-ink-400 text-vanilla-100">
    <sidebar v-if="loggedIn" />
    <logged-out-sidebar v-else />
    <div class="w-full">
      <mobile-nav
        class="sticky top-0 z-30 w-full h-10 border-b lg:hidden bg-ink-300 border-ink-200"
      />
      <repo-header :key="repository.id" class="z-10 w-full md:sticky top-10 lg:top-0" />
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
        <div
          v-if="
            repository.name === $route.params.repo &&
            repository.errorCode &&
            repository.errorCode !== 3003 &&
            !loading
          "
        >
          <div
            class="
              flex
              items-center
              p-4
              space-x-2
              border-b
              bg-cherry bg-opacity-10
              border-cherry border-opacity-20
            "
          >
            <p
              class="max-w-4xl text-cherry error-state"
              v-html="repository.renderedErrorMessage"
            ></p>
          </div>
        </div>
        <Nuxt v-if="isAnalyzed || allowedOnBroken || loading" />

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
    <portal-target class="z-1000" name="modal" @change="modalToggled"></portal-target>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import { RepoHeader, MobileNav, LoggedOutSidebar } from '@/components/Layout'
import { Sidebar } from '@/components/Layout/Sidebar'
import { ZLabel } from '@deepsourcelabs/zeal'
import AuthMixin from '@/mixins/authMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import PortalMixin from '@/mixins/portalMixin'

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
      class: 'antialiased stroke-2 hide-scroll'
    }
  }
})
export default class RepositoryLayout extends mixins(AuthMixin, RepoDetailMixin, PortalMixin) {
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

  refetchData() {
    this.fetchBasicRepoDetails({
      ...this.baseRouteParams,
      refetch: true
    })

    this.fetchWidgets({
      ...this.baseRouteParams,
      refetch: true
    })
  }

  mounted(): void {
    this.$socket.$on('repo-analysis-updated', this.refetchData)
    this.$socket.$on('repo-config-committed', this.refetchData)
    this.$socket.$on('autofix-installation-complete', this.refetchData)
  }

  beforeDestroy(): void {
    this.$socket.$off('repo-analysis-updated', this.refetchData)
    this.$socket.$off('repo-config-committed', this.refetchData)
    this.$socket.$off('autofix-installation-complete', this.refetchData)
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
    if (this.repository.errorCode === 3003) {
      // For ad-hoc runs
      return true
    }

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
