<template>
  <div class="flex min-h-screen mx-auto bg-ink-400 text-vanilla-100">
    <sidebar v-if="loggedIn" />
    <logged-out-sidebar v-else />
    <div class="w-full">
      <mobile-nav
        class="sticky top-0 z-30 w-full h-10 border-b lg:hidden bg-ink-300 border-ink-200"
      />
      <repo-header :key="repository.id" class="z-30 w-full md:sticky top-10 lg:top-0" />
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
            !$fetchState.pending
          "
          class="px-4 pt-4"
        >
          <z-alert v-if="repository.errorCode === 3007" type="danger" :dismissible="true">
            <div class="mr-2 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
              <p class="font-medium" v-html="repository.renderedErrorMessage"></p>
              <div v-if="canEnableAutofix" class="bg-cherry bg-opacity-40" style="width: 168px">
                <z-button
                  :disabled="installing"
                  :is-loading="installing"
                  button-type="ghost"
                  color="vanilla-100"
                  icon="autofix"
                  label="Install Autofix app"
                  loading-label="Verifying installation"
                  size="small"
                  class="modal-primary-action bg-cherry bg-opacity-40 hover:bg-opacity-0"
                  style="width: 168px"
                  @click="openAutofixInstallationUrl(close)"
                />
              </div>
            </div>
          </z-alert>

          <z-alert v-else type="danger" :dismissible="true">
            <p class="font-medium" v-html="repository.renderedErrorMessage"></p>
          </z-alert>
        </div>
        <!-- Check if the repository has been analyzed or not -->
        <Nuxt ref="page" v-if="isAnalyzed || allowedOnBroken || $fetchState.pending" />
        <!-- If not analyzed and an error code is present -->
        <div v-else-if="repository.errorCode" class="p-5">
          <repo-inactive
            v-if="repository.errorCode === 3001"
            :id="repository.id"
            :name="repository.name"
            :defaultBranchName="repository.defaultBranchName"
            @refetch="refetchData"
          />
          <repo-error v-else />
        </div>
        <!-- If not analyzed and has no error code -->
        <div v-else class="p-5">
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
    <client-only>
      <palette
        v-if="showPalette && allowPalette"
        @close="showPalette = false"
        @toggle="showPalette = !showPalette"
        class="z-1000"
      ></palette>
    </client-only>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import { RepoHeader, MobileNav, LoggedOutSidebar } from '@/components/Layout'
import { Sidebar } from '@/components/Layout/Sidebar'
import { ZAlert, ZButton, ZIcon, ZLabel } from '@deepsourcelabs/zeal'
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
import InstallAutofixMixin from '~/mixins/installAutofixMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import PaletteMixin from '~/mixins/paletteMixin'

/**
 * Layout file for `repository` views.
 */
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
    ZAlert,
    ZButton,
    ZIcon,
    ZLabel
  },
  middleware: ['hidePrivateRepo'],
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2 hide-scroll'
    }
  }
})
export default class RepositoryLayout extends mixins(
  AuthMixin,
  InstallAutofixMixin,
  RepoDetailMixin,
  PortalMixin,
  RoleAccessMixin,
  PaletteMixin
) {
  private pollingId = 0

  /**
   * Fetch hook for the repository layout.
   * Fetches:
   * - Base repo details
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    try {
      await this.fetchBasicRepoDetails(this.baseRouteParams)
    } catch (e) {
      this.$toast.danger('There was a problem loading this repository')
    }
  }

  /**
   * Refetches base repo details and widgets for a repository.
   *
   * @returns {Promise<void>}
   */
  async refetchData(): Promise<void> {
    await Promise.all([
      this.fetchBasicRepoDetails({
        ...this.baseRouteParams,
        refetch: true
      }),
      this.fetchWidgets({
        ...this.baseRouteParams,
        refetch: true
      })
    ])
  }

  /**
   * Mounted hook for repository layout, initializes handlers for socket events.
   *
   * @returns {void}
   */
  mounted(): void {
    this.$socket.$on('repo-analysis-updated', this.refetchData)
    this.$socket.$on('repo-config-committed', this.refetchData)
    this.$socket.$on('repo-config-updated', this.refetchData)
    this.$socket.$on('autofix-installation-complete', this.refetchData)
    this.setPaletteEvent()
    this.registerCommands()
  }

  /**
   * BeforeDestroy hook for repository layout, removes handlers for socket events.
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$socket.$off('repo-analysis-updated', this.refetchData)
    this.$socket.$off('repo-config-committed', this.refetchData)
    this.$socket.$off('repo-config-updated', this.refetchData)
    this.$socket.$off('autofix-installation-complete', this.refetchData)
    clearTimeout(this.pollingId)
    this.removePaletteEvent()
  }

  /**
   * Remove refetch events when repo route param changes.
   *
   * @returns {void}
   */
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

  get isRepoWaiting(): boolean {
    return (
      !this.isAnalyzed &&
      !this.allowedOnBroken &&
      this.$fetchState &&
      !this.$fetchState.pending &&
      !this.repository.errorCode &&
      this.repoHasCode &&
      !this.hasLastRunTimedOut
    )
  }

  /**
   * Watcher function to activate polling a repo if it's in waiting state.
   * Triggers immediately!
   *
   * @param {boolean} newIsRepoWaiting
   * @returns {Promise<void>}
   */
  @Watch('isRepoWaiting', { immediate: true })
  triggerPoll(newIsRepoWaiting: boolean): void {
    clearTimeout(this.pollingId)
    if (newIsRepoWaiting) {
      this.pollRepo()
    }
  }

  /**
   * Polling function that polls the status of a repo and keeps polling if the repo is in waiting state (first run).
   *
   * @returns {Promise<void>}
   */
  async pollRepo(): Promise<void> {
    const POLLING_INTERVAL = 5000
    if (process.client) {
      this.pollingId = window.setTimeout(async () => {
        await this.pollRepoStatus(this.baseRouteParams)
        if (this.isRepoWaiting) {
          this.pollRepo()
        }
      }, POLLING_INTERVAL)
    }
  }

  /**
   * Register repo level commands
   *
   * @return {any}
   */
  registerCommands() {
    this.$palette.registerCommands(
      [
        {
          id: 'open-repo-issues',
          label: `Issues`,
          shortkey: 'I',
          icon: `flag`,
          scope: 'repo',
          condition: (route) => {
            return route.name ? !route.name?.startsWith('provider-owner-repo-issues') : true
          },
          keywords: ['issues', 'bugs', 'risks'],
          action: () => {
            this.$router.push(this.$generateRoute(['issues']))
          }
        },
        {
          id: 'open-repo-autofix',
          label: `Autofix`,
          shortkey: 'A',
          icon: `autofix`,
          keywords: ['autofix', 'fix'],
          scope: 'repo',
          condition: (route) => {
            return route.name ? !route.name?.startsWith('provider-owner-repo-autofix') : true
          },
          action: () => {
            this.$router.push(this.$generateRoute(['autofix']))
          }
        },
        {
          id: 'open-repo-metrics',
          label: `Metrics`,
          shortkey: 'M',
          icon: `bar-chart`,
          keywords: ['metrics', 'stats', 'numbers', 'charts'],
          scope: 'repo',
          condition: (route) => {
            return route.name ? !route.name?.startsWith('provider-owner-repo-metrics') : true
          },
          action: () => {
            this.$router.push(this.$generateRoute(['metrics']))
          }
        },
        {
          id: 'open-repo-run-history',
          label: `Analysis history`,
          icon: `history`,
          shortkey: ['H', 'A'],
          keywords: ['metrics', 'stats', 'numbers', 'charts'],
          scope: 'repo',
          condition: (route) => {
            return route.name ? !route.name?.startsWith('provider-owner-repo-history-runs') : true
          },
          action: () => {
            this.$router.push(this.$generateRoute(['history', 'runs']))
          }
        },
        {
          id: 'open-repo-transforms-history',
          label: `Transforms history`,
          shortkey: ['H', 'T'],
          icon: `history`,
          keywords: ['metrics', 'stats', 'numbers', 'charts'],
          scope: 'repo',
          condition: (route) => {
            return route.name
              ? !route.name?.startsWith('provider-owner-repo-history-transforms')
              : true
          },
          action: () => {
            this.$router.push(this.$generateRoute(['history', 'transforms']))
          }
        },
        {
          id: 'open-repo-settings',
          label: `Settings`,
          icon: `settings`,
          shortkey: ['Opt', 'S'],
          keywords: ['settings', 'badges', 'audit', 'members', 'configuration'],
          scope: 'repo',
          condition: (route) => {
            return route.name ? !route.name?.startsWith('provider-owner-repo-settings') : true
          },
          action: () => {
            this.$router.push(this.$generateRoute(['settings']))
          }
        }
      ],
      'provider-owner-repo'
    )
  }
}
</script>
