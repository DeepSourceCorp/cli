<template>
  <section class="repository-level-settings-page grid grid-cols-1 lg:grid-cols-16-fr">
    <nav
      class="hide-scroll vertical-sidebar hidden gap-x-8 overflow-x-auto border-b border-slate-400 px-4 pt-2 lg:sticky lg:flex lg:flex-col lg:gap-y-1 lg:border-r lg:p-2"
    >
      <template v-for="item in navItems">
        <nuxt-link
          v-if="isNavLinkVisible(item)"
          :key="item.label"
          :to="$generateRoute(item.link)"
          class="group flex-shrink-0 rounded-md text-sm hover:bg-ink-300"
        >
          <span
            class="block rounded-md p-2 group-hover:text-vanilla-100"
            :class="$route.path.includes(item.link.join('/')) ? 'bg-ink-300' : 'text-vanilla-400'"
            >{{ item.label }}</span
          >
        </nuxt-link>
      </template>
    </nav>

    <nuxt-child class="mb-28 lg:mb-24" />

    <floating-button-mobile :nav-items="navItemsForMobile" />
  </section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZTab } from '@deepsource/zeal'

import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { AppFeatures, RepoPerms } from '~/types/permTypes'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

interface TabLink {
  label: string
  link: string[]
  icon: string
  perms?: RepoPerms[]
  forTeams?: boolean
  gateFeature?: AppFeatures[]
  disableOnPrem?: boolean
}

@Component({
  components: {
    ZTab
  },
  layout: 'repository',
  middleware: [
    'perm',
    async function ({ route, redirect }) {
      const { provider, owner, repo } = route.params
      if (route.name === 'provider-owner-repo-settings') {
        redirect(`/${provider}/${owner}/${repo}/settings/general`)
      }
    }
  ],
  meta: {
    auth: {
      strict: true,
      repoPerms: [
        RepoPerms.VIEW_DSN,
        RepoPerms.GENERATE_SSH_KEY_PAIR,
        RepoPerms.CHANGE_DEFAULT_ANALYSIS_BRANCH,
        RepoPerms.CHANGE_ISSUE_TYPES_TO_REPORT,
        RepoPerms.CHANGE_ISSUES_TO_TYPE_TO_BLOCK_PRS_ON,
        RepoPerms.CHANGE_PRIORITY_SETTINGS_TO_REPORT,
        RepoPerms.CHANGE_PRIORITY_SETTINGS_TO_BLOCK_PRS_ON,
        RepoPerms.DEACTIVATE_ANALYSIS_ON_REPOSITORY,
        RepoPerms.ADD_REMOVE_MEMBERS,
        RepoPerms.UPDATE_ROLE_OF_EXISTING_MEMBERS,
        RepoPerms.VIEW_AUDIT_LOG,
        RepoPerms.VIEW_BADGES,
        RepoPerms.CHANGE_ISSUE_PRIORITY,
        RepoPerms.CHANGE_INTEGRATION_SETTINGS,
        RepoPerms.VIEW_CODE_COVERAGE_SETTINGS
      ]
    }
  },
  scrollToTop: true
})
export default class Settings extends mixins(RoleAccessMixin, RepoDetailMixin) {
  navItems: TabLink[] = [
    {
      label: 'General',
      link: ['settings', 'general'],
      icon: 'settings',
      perms: [RepoPerms.CHANGE_DEFAULT_ANALYSIS_BRANCH, RepoPerms.DEACTIVATE_ANALYSIS_ON_REPOSITORY]
    },
    {
      label: 'Configuration',
      icon: 'sliders',
      link: ['settings', 'config']
    },
    {
      label: 'Code Coverage',
      icon: 'test-coverage',
      link: ['settings', 'code-coverage'],
      perms: [RepoPerms.VIEW_CODE_COVERAGE_SETTINGS]
    },
    {
      label: 'Reporting',
      link: ['settings', 'reporting'],
      icon: 'bar-chart',
      perms: [
        RepoPerms.VIEW_DSN,
        RepoPerms.CHANGE_ISSUE_TYPES_TO_REPORT,
        RepoPerms.CHANGE_ISSUES_TO_TYPE_TO_BLOCK_PRS_ON,
        RepoPerms.CHANGE_PRIORITY_SETTINGS_TO_REPORT,
        RepoPerms.CHANGE_PRIORITY_SETTINGS_TO_BLOCK_PRS_ON
      ]
    },
    {
      label: 'Issue priority',
      icon: 'flag',
      link: ['settings', 'issue-priority'],
      perms: [RepoPerms.CHANGE_ISSUE_PRIORITY]
    },
    { label: 'Badges', icon: 'droplet', link: ['settings', 'badges'] },
    {
      label: 'Autofix settings',
      link: ['settings', 'autofix'],
      icon: 'autofix',
      perms: [RepoPerms.INSTALL_AUTOFIX_APP, RepoPerms.CREATE_AUTOFIXES],
      gateFeature: [AppFeatures.AUTOFIX]
    },
    { label: 'Ignore rules', link: ['settings', 'ignore-rules'], icon: 'list' },
    {
      label: 'SSH access',
      link: ['settings', 'ssh-access'],
      icon: 'key',
      perms: [RepoPerms.GENERATE_SSH_KEY_PAIR]
    },
    {
      label: 'Audit log',
      icon: 'list',
      link: ['settings', 'audit-log'],
      perms: [RepoPerms.VIEW_AUDIT_LOG]
    },
    {
      label: 'Repository members',
      icon: 'users',
      link: ['settings', 'repo-members'],
      perms: [RepoPerms.UPDATE_ROLE_OF_EXISTING_MEMBERS],
      forTeams: true
    },
    {
      label: 'Integrations',
      icon: 'list',
      link: ['settings', 'integrations'],
      perms: [RepoPerms.CHANGE_INTEGRATION_SETTINGS],
      forTeams: true
    }
  ]

  get isTeamAccount(): boolean {
    if (this.activeDashboardContext && this.activeDashboardContext.type) {
      return this.activeDashboardContext.type !== 'user'
    }
    return true
  }

  get navItemsForMobile() {
    const visibleNavItems = this.navItems.filter((item) => this.isNavLinkVisible(item))

    return visibleNavItems.map((item) => {
      return {
        label: item.label,
        routePath: this.$generateRoute(item.link)
      }
    })
  }

  /**
   * Set meta tags
   *
   * @return {Record<string, string>}
   */
  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `Settings • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }

  /**
   * Validate if Navlinks should be shown or not
   * TODO: Make it a computed property
   *
   * @param {TabLink} item
   *
   * @return {boolean}
   */
  isNavLinkVisible(item: TabLink): boolean {
    if (Array.isArray(item.gateFeature)) {
      return this.$gateKeeper.provider(item.gateFeature)
    }

    if (item.forTeams && !this.isTeamAccount) {
      return false
    }

    if (this.$config.onPrem && item.disableOnPrem) {
      return false
    }

    if (item.perms) {
      const allowedMap = item.perms.map((perm) => {
        return this.$gateKeeper.repo(perm, this.repoPerms.permission)
      })

      return allowedMap.indexOf(true) > -1 ? true : false
    }
    return true
  }
}
</script>

<style scoped>
.repository-level-settings-page {
  --repository-header-height: 97px;
}

@media screen and (min-width: 1024px) {
  .vertical-sidebar {
    --vertical-sidebar-top-offset: var(--repository-header-height);

    top: var(--vertical-sidebar-top-offset);
    height: calc(100vh - var(--vertical-sidebar-top-offset));
  }
}
</style>
