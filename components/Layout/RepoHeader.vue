<template>
  <div>
    <div
      class="grid grid-cols-1 gap-2 border-b lg:gap-0 grid-row-3 xl:grid-cols-fr-fr-22 xl:grid-rows-2 auto-rows-auto bg-ink-300 min-h-24 border-ink-200"
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
                internalStarredState
                  ? 'Click to remove from starred repositories'
                  : 'Star this repository'
              "
              buttonType="ghost"
              icon="z-star"
              size="x-small"
              class="p-1"
              :color="internalStarredState ? 'juniper' : 'hover:text-slate'"
              :class="internalStarredState ? 'opacity-1' : 'opacity-40 hover:opacity-70'"
              :iconColor="'current'"
              @click.prevent="toggleStar(!internalStarredState)"
            />
            <a
              v-if="repository.vcsProvider"
              :href="repository.vcsUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <z-tag
                class="border-2 border-ink-200"
                spacing="p-0.5"
                bg-color="ink-200"
                v-tooltip="`Open repo on ${$providerMetaMap[repository.vcsProvider].text}`"
                size="base"
                :iconLeft="repoVCSIcon"
              ></z-tag>
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
          :commitId="lastRun.commitOid"
          :runId="lastRun.runId"
          :analyzer="lastRun.config.analyzers[0].name"
          :defaultBranch="repository.defaultBranchName"
          :lastAnalyzed="lastRun.finishedAt"
          :vcsUrl="repository.vcsDefaultBranchUrl || repository.vcsUrl"
          :vcsCommitUrl="lastRun.vcsCommitUrl"
          :currentlyAnalysing="repository.runs && repository.runs.totalCount"
          :canChangeBranch="canChangeBranch"
          class="flex flex-col h-full px-4 py-2 space-y-2 text-sm md:px-3 xl:border-l xl:border-ink-200 text-vanilla-400"
        ></repo-header-info>
      </div>
      <div id="tabs" class="flex xl:col-span-2">
        <div class="flex self-end px-4 space-x-5 overflow-auto flex-nowrap hide-scroll">
          <template v-for="item in navItems">
            <nuxt-link
              v-if="isNavLinkVisible(item)"
              :key="item.label"
              :to="$generateRoute(item.link)"
            >
              <z-tab :icon="item.icon" :isActive="activeLink(item)">{{ item.label }}</z-tab>
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

import { ZLabel, ZButton, ZTab, ZTag, ZIcon } from '@deepsourcelabs/zeal'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { RepoPerms, TeamPerms } from '~/types/permTypes'
import ActiveUserMixin from '~/mixins/activeUserMixin'

interface TabLink {
  icon: string
  label: string
  link?: string
  loginRequired?: boolean
  matchName?: string[]
  perms?: RepoPerms[]
  pattern?: RegExp
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
    perms: [RepoPerms.READ_REPO]
  },
  {
    icon: 'bar-chart',
    label: 'Metrics',
    link: 'metrics',
    pattern: new RegExp(/^provider-owner-repo-metrics$/)
  },
  {
    icon: 'history',
    label: 'History',
    link: 'history/runs',
    pattern: new RegExp(/^provider-owner-repo-(history|run|runs|transforms|transforms)/)
  },
  {
    icon: 'settings',
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
  internalStarredState = false

  async fetch(): Promise<void> {
    await this.fetchRepoPerms(this.baseRouteParams)
    await this.fetchBasicRepoDetails({
      ...this.baseRouteParams,
      refetch: true
    })
    this.fetchRepoRunCount({
      ...this.baseRouteParams,
      status: 'pend'
    })

    this.internalStarredState = this.repository.isStarred as boolean
    this.$localStore.set('starred-repos', this.repository.id, this.internalStarredState)
  }

  refetchOnSocketEvent(): void {
    this.fetchRepoRunCount({
      ...this.baseRouteParams,
      status: 'pend'
    })
  }

  mounted(): void {
    this.internalStarredState = this.$localStore.get('starred-repos', this.repository.id) as boolean
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
    const provider = this.repository.vcsProvider.toLowerCase()
    return ['github_enterprise', 'github-enterprise'].includes(provider) ? 'github' : provider
  }

  async toggleStar(isStarred: boolean) {
    this.internalStarredState = isStarred

    await this.updateStarredRepo({
      action: isStarred ? 'ADD' : 'REMOVE',
      repoId: this.repository.id
    })

    this.fetchBasicRepoDetails({
      ...this.baseRouteParams,
      refetch: true
    })

    this.$localStore.set('starred-repos', this.repository.id, this.internalStarredState)
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
    if (item.loginRequired) {
      return item.perms && this.loggedIn
        ? this.$gateKeeper.repo(item.perms, this.repoPerms.permission)
        : this.loggedIn
    }
    return true
  }
}
</script>
