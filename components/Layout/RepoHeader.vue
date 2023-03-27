<template>
  <div>
    <div
      class="grid grid-cols-1 gap-2 border-b lg:gap-0 grid-row-3 xl:grid-cols-fr-fr-22 xl:grid-rows-2 auto-rows-auto bg-ink-300 min-h-24 border-slate-400"
    >
      <div id="header" class="xl:col-span-2">
        <div class="px-4 pt-3 space-x-2 space-y-2 xl:space-y-0">
          <h2
            class="flex flex-wrap items-center gap-3 text-lg font-medium leading-none xl:text-xl text-vanilla-400"
          >
            <div class="space-x-0.5 md:space-x-1">
              <nuxt-link
                v-if="canReadTeamPage"
                :to="['', provider, owner].join('/')"
                class="inline transition-colors duration-75 cursor-pointer hover:text-vanilla-300"
                >{{ $route.params.owner }}</nuxt-link
              >
              <span v-else class="inline">{{ $route.params.owner }}</span>
              <span class="inline">/</span>
              <nuxt-link :to="$generateRoute()" class="inline font-bold text-vanilla-100">
                {{ $route.params.repo }}
              </nuxt-link>
            </div>
            <z-button
              v-if="allowStar"
              v-tooltip="
                repository.isStarred
                  ? 'Click to remove from starred repositories'
                  : 'Star this repository'
              "
              button-type="ghost"
              icon="z-star"
              size="x-small"
              class="p-1"
              :color="repository.isStarred ? 'juniper' : 'hover:text-slate'"
              :class="repository.isStarred ? 'opacity-1' : 'opacity-40 hover:opacity-70'"
              :icon-color="'current'"
              @click.prevent="toggleStar(!repository.isStarred)"
            />
            <a
              v-if="repository.vcsProvider"
              :href="repository.vcsUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <z-tag
                v-tooltip="`Open repo on ${$providerMetaMap[repository.vcsProvider].text}`"
                class="border-2 border-slate-400"
                spacing="p-0.5"
                bg-color="ink-200"
                size="base"
                :icon-left="repoVCSIcon"
              />
            </a>

            <template v-if="repository.errorCode">
              <z-label
                v-if="repository.errorCode === 3003"
                class="inline-block select-none"
                state="info"
              >
                Pending commit
              </z-label>
              <z-label v-else class="inline-block select-none" state="error"> Error </z-label>
            </template>
            <z-label
              v-else-if="repository.isActivated === true"
              class="inline-block select-none"
              state="success"
            >
              Active
            </z-label>
            <z-label
              v-else-if="repository.isActivated === false"
              class="inline-block select-none"
              state="warning"
            >
              Inactive
            </z-label>
          </h2>
        </div>
      </div>
      <div v-if="repository && lastRun" id="info" class="xl:row-span-2">
        <repo-header-info
          :commit-id="lastRun.commitOid"
          :run-id="lastRun.runId"
          :analyzer="lastRun.config.analyzers[0].name"
          :default-branch="repository.defaultBranchName"
          :last-analyzed="lastRun.finishedAt"
          :vcs-url="repository.vcsDefaultBranchUrl || repository.vcsUrl"
          :vcs-commit-url="lastRun.vcsCommitUrl"
          :currently-analysing="repository.runs && repository.runs.totalCount"
          :can-change-branch="canChangeBranch"
          class="flex flex-col h-full px-4 py-2 space-y-2 text-sm md:px-3 xl:border-l xl:border-slate-400 text-vanilla-400"
        />
      </div>
      <div id="tabs" class="flex xl:col-span-2">
        <div class="flex self-end px-4 space-x-5 overflow-auto flex-nowrap hide-scroll">
          <template v-for="item in navItems">
            <nuxt-link
              v-if="isNavLinkVisible(item)"
              :key="item.label"
              :to="$generateRoute(item.link)"
            >
              <z-tab :icon="item.icon" :is-active="activeLink(item)">{{ item.label }}</z-tab>
            </nuxt-link>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { Run, Maybe } from '~/types/types'
import RepoHeaderInfo from './RepoHeaderInfo.vue'
import RouteParamsMixin from '@/mixins/routeParamsMixin'

import { ZLabel, ZButton, ZTab, ZTag, ZIcon } from '@deepsource/zeal'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { AppFeatures, RepoPerms, TeamPerms } from '~/types/permTypes'
import ActiveUserMixin from '~/mixins/activeUserMixin'

interface TabLink {
  icon: string
  label: string
  link?: string
  loginRequired?: boolean
  matchName?: string[]
  perms?: RepoPerms[]
  pattern?: RegExp
  gateFeature?: AppFeatures[]
  forBeta?: boolean
}

const navItems: TabLink[] = [
  {
    icon: 'tachometer-fast',
    label: 'Overview',
    pattern: new RegExp(/^provider-owner-repo$/)
  },
  {
    icon: 'flag',
    label: 'Issues',
    link: 'issues',
    pattern: new RegExp(/^provider-owner-repo-issue*/)
  },
  {
    icon: 'autofix',
    label: 'Autofix',
    link: 'autofix',
    pattern: new RegExp(/^provider-owner-repo-autofix*/),
    loginRequired: true,
    perms: [RepoPerms.READ_REPO],
    gateFeature: [AppFeatures.AUTOFIX]
  },
  {
    icon: 'bar-chart',
    label: 'Metrics',
    link: 'metrics',
    pattern: new RegExp(/^provider-owner-repo-metrics-.*$/)
  },
  {
    icon: 'pie-chart',
    label: 'Reports',
    link: 'reports/owasp-top-10',
    loginRequired: true,
    perms: [RepoPerms.VIEW_REPORTS],
    pattern: new RegExp(/^provider-owner-repo-reports-*/)
  },
  {
    icon: 'history',
    label: 'History',
    link: 'history/runs',
    pattern: new RegExp(/^provider-owner-repo-(history|run|runs|transforms|transforms)/)
  },
  {
    icon: 'wrench',
    label: 'Settings',
    link: 'settings/general',
    loginRequired: true,
    perms: [
      RepoPerms.VIEW_DSN,
      RepoPerms.GENERATE_SSH_KEY_PAIR,
      RepoPerms.CHANGE_DEFAULT_ANALYSIS_BRANCH,
      RepoPerms.CHANGE_ISSUE_TYPES_TO_REPORT,
      RepoPerms.CHANGE_ISSUES_TO_TYPE_TO_BLOCK_PRS_ON,
      RepoPerms.DEACTIVATE_ANALYSIS_ON_REPOSITORY,
      RepoPerms.ADD_REMOVE_MEMBERS,
      RepoPerms.UPDATE_ROLE_OF_EXISTING_MEMBERS,
      RepoPerms.VIEW_AUDIT_LOGS
    ],
    pattern: new RegExp(/^provider-owner-repo-settings-*/)
  }
]

@Component({
  components: {
    ZTab,
    ZTag,
    ZIcon,
    ZLabel,
    ZButton,
    RepoHeaderInfo
  },
  data() {
    return {
      navItems
    }
  }
})
export default class RepoHeader extends mixins(
  RouteParamsMixin,
  RepoDetailMixin,
  RoleAccessMixin,
  ActiveUserMixin
) {
  navItems: TabLink[]

  async fetch(): Promise<void> {
    // skipcq: TCV-001
    await Promise.all([
      this.fetchRepoPerms(this.baseRouteParams),
      this.fetchBasicRepoDetails(this.baseRouteParams),
      this.fetchMetrics({ ...this.baseRouteParams })
    ])

    // skipcq: TCV-001
    this.fetchRepoRunCount({
      ...this.baseRouteParams,
      status: 'pend'
    })

    //? Pre-load first link of metric
    const firstMetric = this.repository.metricsCaptured?.[0]
    if (firstMetric) {
      const metricRecord = this.navItems.findIndex((navItem) => navItem.label === 'Metrics')
      this.navItems[metricRecord].link = `metrics/${firstMetric.shortcode}`
    }
  }

  refetchOnSocketEvent(): void {
    this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true })
    this.fetchRepoRunCount({
      ...this.baseRouteParams,
      status: 'pend'
    })
  }

  mounted(): void {
    this.$socket.$on('repo-analysis-updated', this.refetchOnSocketEvent)
  }

  beforeDestroy(): void {
    this.$socket.$off('repo-analysis-updated', this.refetchOnSocketEvent)
  }

  get lastRun(): Maybe<Run> {
    return this.repository?.latestAnalysisRun || null
  }

  get canReadTeamPage(): boolean {
    if (this.teamPerms.permission && this.activeOwner === this.$route.params.owner) {
      return this.$gateKeeper.team(TeamPerms.VIEW_TEAM_HOME, this.teamPerms.permission)
    }
    return false
  }

  get repoVCSIcon(): string {
    const provider = this.repository.vcsProvider
    return this.$providerMetaMap[provider].icon ?? ''
  }

  async toggleStar(isStarred: boolean) {
    this.updateRepositoryInStore({ ...this.repository, isStarred: isStarred })

    const response = await this.updateStarredRepo({
      action: isStarred ? 'ADD' : 'REMOVE',
      repoId: this.repository.id
    })

    if (!response.ok) {
      this.updateRepositoryInStore({ ...this.repository, isStarred: !isStarred })
      this.$toast.danger(
        "Couldn't star this repository, if the issue persists please contact support"
      )
    }

    this.fetchBasicRepoDetails({
      ...this.baseRouteParams,
      refetch: true
    })
  }

  public activeLink(item: TabLink): boolean {
    if (item.pattern && this.$route.name) {
      return item.pattern.test(this.$route.name)
    }
    return false
  }

  get canChangeBranch(): boolean {
    if (this.loggedIn) {
      return this.$gateKeeper.repo(
        RepoPerms.CHANGE_DEFAULT_ANALYSIS_BRANCH,
        this.repoPerms.permission
      )
    }
    return false
  }

  get allowStar(): boolean {
    if (this.loggedIn) {
      return this.$gateKeeper.repo(RepoPerms.ALLOW_STAR, this.repoPerms.permission)
    }
    return false
  }

  isNavLinkVisible(item: TabLink): boolean {
    const { provider } = this.$route.params

    if (item.loginRequired && !this.loggedIn) {
      return false
    }

    const allowedForProvider = item.gateFeature
      ? this.$gateKeeper.provider(item.gateFeature, provider)
      : true

    const allowedForRepo = item.perms
      ? this.$gateKeeper.repo(item.perms, this.repoPerms.permission)
      : true

    const allowForbeta =
      this.$config.onPrem || (item.forBeta ? Boolean(this.viewer.isBetaTester) : true)

    return allowedForRepo && allowedForProvider && allowForbeta
  }
}
</script>
