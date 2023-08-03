<template>
  <div>
    <div
      class="flex h-13 w-full items-center justify-between gap-x-2 border-b border-slate-400 bg-ink-300 p-2 lg:px-4 lg:py-3"
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
            <z-icon :icon="icon" color="vanilla-100" class="mb-0.5" />
          </span>

          <span class="line-clamp-1">
            <nuxt-link v-if="canReadTeamPage" :to="teamPageUrl">{{ owner }}</nuxt-link>
            <span v-else class="text-vanilla-400">{{ owner }}</span>

            <span>/</span>

            <template v-if="isSubRepository">
              <nuxt-link :to="$generateRoute(monorepoName, false)" class="text-vanilla-400">
                {{ monorepoName }}
              </nuxt-link>
              <span class="text-vanilla-100">/</span>
              <span class="text-vanilla-100">
                {{ subRepositoryPath }}
              </span>
            </template>

            <span v-else class="text-vanilla-100">
              {{ repository.displayName }}
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

            <z-tag-v2 :type="tagState">
              <template v-if="isMonorepo" #icon>
                <z-icon color="aqua" icon="monorepo" />
              </template>

              {{ tagText }}
            </z-tag-v2>
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
          v-if="repository.isActivated"
          class="rounded-sm p-0.5 hover:bg-ink-200"
          @click="$root.$emit('toggle-metadata-view-dialog')"
        >
          <z-icon color="vanilla-400" icon="info-circle" size="small" />
        </button>
      </div>
    </div>

    <div
      class="hide-scroll h-nav-items-container flex gap-x-5 overflow-x-auto border-b border-slate-400 bg-ink-400 px-3 pt-3"
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

import ActiveUserMixin from '~/mixins/activeUserMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RouteParamsMixin from '~/mixins/routeParamsMixin'

import { AppFeatures, RepoPerms, TeamPerms } from '~/types/permTypes'
import { RepositoryKindChoices } from '~/types/types'

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
  repoKindChoices: RepositoryKindChoices[]
}

@Component({})
export default class RepoHeader extends mixins(
  RouteParamsMixin,
  RepoDetailMixin,
  RoleAccessMixin,
  ActiveUserMixin
) {
  async fetch(): Promise<void> {
    await this.fetchRepoPerms(this.baseRouteParams)

    if (this.isMonorepo) {
      return
    }

    await this.fetchMetrics({ ...this.baseRouteParams, fetchPerms: true })

    //? Pre-load first link of metric
    const firstMetric = this.repository.metricsCaptured?.[0]
    if (firstMetric) {
      const metricRecord = this.navItems.findIndex((navItem) => navItem.label === 'Metrics')
      this.navItems[metricRecord].link = `metrics/${firstMetric.shortcode}`
    }
  }

  get canReadTeamPage(): boolean {
    if (this.teamPerms.permission && this.activeOwner === this.owner) {
      return this.$gateKeeper.team(TeamPerms.VIEW_TEAM_HOME, this.teamPerms.permission)
    }
    return false
  }

  get icon() {
    const { isPrivate } = this.repository

    if (this.isSubRepository) {
      return isPrivate ? 'folder-locked' : 'folder-globe'
    }

    if (this.repoKind === RepositoryKindChoices.Repo) {
      return isPrivate ? 'z-lock' : 'globe'
    }

    return 'monorepo'
  }

  get isMonorepo(): boolean {
    return this.repoKind === RepositoryKindChoices.Monorepo
  }

  get isSubRepository(): boolean {
    return this.repoKind === RepositoryKindChoices.Subrepo
  }

  get monorepoName(): string {
    return this.repository.displayName.split('/')[0].trim()
  }

  get navItems(): TabLink[] {
    return [
      {
        icon: this.isMonorepo ? 'folder-tree' : 'gauge',
        label: this.isMonorepo ? 'Sub-repositories' : 'Overview',
        pattern: new RegExp(/^provider-owner-repo$/),
        repoKindChoices: [
          RepositoryKindChoices.Repo,
          RepositoryKindChoices.Monorepo,
          RepositoryKindChoices.Subrepo
        ]
      },
      {
        icon: 'flag',
        label: 'Issues',
        link: 'issues',
        pattern: new RegExp(/^provider-owner-repo-issue*/),
        repoKindChoices: [RepositoryKindChoices.Repo, RepositoryKindChoices.Subrepo]
      },
      {
        icon: 'autofix',
        label: 'Autofix',
        link: 'autofix',
        pattern: new RegExp(/^provider-owner-repo-autofix*/),
        loginRequired: true,
        perms: [RepoPerms.READ_REPO],
        gateFeature: [AppFeatures.AUTOFIX],
        repoKindChoices: [RepositoryKindChoices.Repo, RepositoryKindChoices.Subrepo]
      },
      {
        icon: 'bar-chart',
        label: 'Metrics',
        link: 'metrics',
        pattern: new RegExp(/^provider-owner-repo-metrics-.*$/),
        repoKindChoices: [RepositoryKindChoices.Repo, RepositoryKindChoices.Subrepo]
      },
      {
        icon: 'pie-chart',
        label: 'Reports',
        link: 'reports/owasp-top-10',
        loginRequired: true,
        perms: [RepoPerms.VIEW_REPORTS],
        pattern: new RegExp(/^provider-owner-repo-reports-*/),
        repoKindChoices: [RepositoryKindChoices.Repo, RepositoryKindChoices.Subrepo]
      },
      {
        icon: 'history',
        label: 'History',
        link: 'history/runs',
        pattern: new RegExp(/^provider-owner-repo-(history|run|runs|transforms|transforms)/),
        repoKindChoices: [RepositoryKindChoices.Repo, RepositoryKindChoices.Subrepo]
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
        pattern: new RegExp(/^provider-owner-repo-settings-*/),
        repoKindChoices: [
          RepositoryKindChoices.Repo,
          RepositoryKindChoices.Monorepo,
          RepositoryKindChoices.Subrepo
        ]
      }
    ]
  }

  get repoKind(): RepositoryKindChoices {
    return this.repository.kind
  }

  get repoVCSIcon(): string {
    const provider = this.repository.vcsProvider
    return this.$providerMetaMap[provider].icon ?? ''
  }

  get subRepositoryPath(): string {
    return this.repository.displayName.split('/').slice(1).join(' / ')
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

  get tagState(): string {
    if (this.isMonorepo) {
      return 'aqua'
    }

    const { errorCode, isActivated } = this.repository

    if (errorCode) {
      return errorCode === 3003 ? 'aqua' : 'cherry'
    }

    return isActivated ? 'juniper' : 'honey'
  }

  get tagText() {
    if (this.isMonorepo) {
      return 'MONOREPO'
    }

    const { errorCode, isActivated } = this.repository

    if (errorCode) {
      return errorCode === 3003 ? 'Pending commit' : 'Error'
    }

    return isActivated ? 'Active' : 'Inactive'
  }

  get repoName() {
    return this.isSubRepository ? this.repository.displayName : this.repo
  }

  isNavLinkVisible(item: TabLink): boolean {
    const isItemValidForRepoKind = item.repoKindChoices.includes(this.repoKind)

    if (!isItemValidForRepoKind) {
      return false
    }

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
