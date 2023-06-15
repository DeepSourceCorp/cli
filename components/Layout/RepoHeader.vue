<template>
  <div>
    <div
      class="flex h-13 w-full items-center justify-between border-b border-slate-400 bg-ink-300 p-2 lg:py-3 lg:px-4"
    >
      <div class="flex items-center lg:gap-x-3">
        <z-button
          id="mobile-menu-toggle"
          button-type="ghost"
          color="vanilla-400"
          icon="sidebar-toggle"
          size="small"
          class="lg:hidden"
          @click="triggerExpand"
        />

        <h2 class="flex items-center gap-x-2 text-base font-medium text-vanilla-400">
          <span class="hidden rounded-lg bg-ink-200 p-1 pb-0.5 lg:inline-block">
            <z-icon
              :icon="repository.isPrivate ? 'z-lock' : 'globe'"
              color="vanilla-100"
              class="mb-0.5"
            />
          </span>

          <span class="line-clamp-1">
            <nuxt-link v-if="canReadTeamPage" :to="teamPageUrl">{{ owner }}</nuxt-link>
            <span v-else class="text-vanilla-400">{{ owner }}</span>

            <span>/</span>

            <span class="text-vanilla-100">
              {{ repo }}
            </span>
          </span>
        </h2>

        <!-- Desktop specific elements -->
        <div class="hidden items-center gap-x-2 lg:flex">
          <button
            v-if="allowStar"
            v-tooltip="
              repository.isStarred
                ? 'Click to remove from starred repositories'
                : 'Star this repository'
            "
            class="rounded-sm p-1 hover:bg-ink-200"
            @click.prevent="toggleStar(!repository.isStarred)"
          >
            <z-icon
              :color="repository.isStarred ? 'juniper' : 'slate'"
              :icon="repository.isStarred ? 'star-filled' : 'star-outline'"
              :class="repository.isStarred ? 'opacity-1' : 'opacity-40 hover:opacity-70'"
            />
          </button>

          <div class="flex items-center gap-x-3">
            <!-- Applying `flex` below that ensures vertical alignment isn't off since `ZTag` is another `flex` element -->
            <a
              :href="repository.vcsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center"
            >
              <z-tag
                v-tooltip="`Open repo on ${$providerMetaMap[repository.vcsProvider].text}`"
                :icon-left="repoVCSIcon"
                spacing="p-3px"
                class="border border-slate-400"
              />
            </a>

            <z-label :state="labelState" class="p-3px inline-block select-none">
              {{ labelText }}
            </z-label>
          </div>
        </div>
      </div>

      <!-- Mobile specific elements -->
      <div class="flex items-center gap-x-5 lg:hidden">
        <button
          v-if="allowStar"
          class="rounded-sm p-0.5 hover:bg-ink-200"
          @click.prevent="toggleStar(!repository.isStarred)"
        >
          <z-icon
            :color="repository.isStarred ? 'juniper' : 'vanilla-400'"
            :icon="repository.isStarred ? 'star-filled' : 'star-outline'"
          />
        </button>

        <button
          v-if="allowStar"
          class="rounded-sm p-0.5 hover:bg-ink-200"
          @click="$root.$emit('toggle-metadata-view-dialog')"
        >
          <z-icon color="vanilla-400" icon="info-circle" size="small" />
        </button>
      </div>
    </div>

    <div
      class="hide-scroll h-nav-items-container space-x-5 overflow-x-auto border-b border-slate-400 bg-ink-400 px-3 pt-3"
    >
      <template v-for="item in navItems">
        <nuxt-link v-if="isNavLinkVisible(item)" :key="item.label" :to="$generateRoute(item.link)">
          <z-tab :icon="item.icon" :is-active="activeLink(item)">{{ item.label }}</z-tab>
        </nuxt-link>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZLabel, ZTab, ZTag } from '@deepsource/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RouteParamsMixin from '~/mixins/routeParamsMixin'

import { AppFeatures, RepoPerms, TeamPerms } from '~/types/permTypes'

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

@Component({
  components: {
    ZButton,
    ZIcon,
    ZLabel,
    ZTab,
    ZTag
  }
})
export default class RepoHeader extends mixins(
  RouteParamsMixin,
  RepoDetailMixin,
  RoleAccessMixin,
  ActiveUserMixin
) {
  navItems: TabLink[] = [
    {
      icon: 'gauge',
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
        RepoPerms.VIEW_AUDIT_LOG
      ],
      pattern: new RegExp(/^provider-owner-repo-settings-*/)
    }
  ]

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

  get canReadTeamPage(): boolean {
    if (this.teamPerms.permission && this.activeOwner === this.owner) {
      return this.$gateKeeper.team(TeamPerms.VIEW_TEAM_HOME, this.teamPerms.permission)
    }
    return false
  }

  get repoVCSIcon(): string {
    const provider = this.repository.vcsProvider
    return this.$providerMetaMap[provider].icon ?? ''
  }

  get teamPageUrl(): string {
    const { provider, owner } = this.$route.params
    return ['', provider, owner].join('/')
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

  get allowStar(): boolean {
    if (this.loggedIn) {
      return this.$gateKeeper.repo(RepoPerms.ALLOW_STAR, this.repoPerms.permission)
    }
    return false
  }

  get labelState() {
    const { errorCode, isActivated } = this.repository

    if (errorCode) {
      return errorCode === 3003 ? 'info' : 'danger'
    }

    return isActivated ? 'success' : 'warning'
  }

  get labelText() {
    const { errorCode, isActivated } = this.repository

    if (errorCode) {
      return errorCode === 3003 ? 'Pending commit' : 'Error'
    }

    return isActivated ? 'Active' : 'Inactive'
  }

  isNavLinkVisible(item: TabLink): boolean {
    if (item.loginRequired && !this.loggedIn) {
      return false
    }

    const allowedForProvider = item.gateFeature
      ? this.$gateKeeper.provider(item.gateFeature, this.provider)
      : true

    const allowedForRepo = item.perms
      ? this.$gateKeeper.repo(item.perms, this.repoPerms.permission)
      : true

    const allowForbeta =
      this.$config.onPrem || (item.forBeta ? Boolean(this.viewer.isBetaTester) : true)

    return allowedForRepo && allowedForProvider && allowForbeta
  }

  triggerExpand() {
    this.$root.$emit('ui:show-sidebar-menu')
  }
}
</script>

<style scoped>
.p-3px {
  padding: 3px;
}

.h-nav-items-container {
  height: 45px;
}
</style>
