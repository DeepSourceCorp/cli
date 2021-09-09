<template>
  <section>
    <div class="flex xl:col-span-2 border-b border-ink-200">
      <div class="flex self-end px-4 pt-2 space-x-8 overflow-auto flex-nowrap">
        <template v-for="item in navItems">
          <nuxt-link
            v-if="isNavLinkVisible(item)"
            :key="item.label"
            :to="$generateRoute(item.link)"
          >
            <z-tab
              :isActive="$route.path.includes(item.link.join('/'))"
              border-active-color="vanilla-400"
            >
              <span class="text-sm cursor-pointer">{{ item.label }}</span>
            </z-tab>
          </nuxt-link>
        </template>
      </div>
    </div>
    <NuxtChild />
  </section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZTab } from '@deepsourcelabs/zeal'

import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { RepoPerms } from '~/types/permTypes'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

interface TabLink {
  label: string
  link: string | string[]
  perms?: RepoPerms[]
  forTeams?: boolean
}

@Component({
  components: {
    ZTab
  },
  layout: 'repository',
  middleware: [
    'perm',
    async function ({ store, route, redirect, error }) {
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
        RepoPerms.DEACTIVATE_ANALYSIS_ON_REPOSITORY,
        RepoPerms.ADD_REMOVE_MEMBERS,
        RepoPerms.UPDATE_ROLE_OF_EXISTING_MEMBERS,
        RepoPerms.VIEW_AUDIT_LOGS,
        RepoPerms.VIEW_BADGES
      ]
    }
  }
})
export default class Settings extends mixins(RoleAccessMixin, RepoDetailMixin) {
  navItems: TabLink[] = [
    {
      label: 'General',
      link: ['settings', 'general'],
      perms: [
        RepoPerms.CHANGE_DEFAULT_ANALYSIS_BRANCH,
        RepoPerms.CHANGE_ISSUE_TYPES_TO_REPORT,
        RepoPerms.CHANGE_ISSUES_TO_TYPE_TO_BLOCK_PRS_ON,
        RepoPerms.DEACTIVATE_ANALYSIS_ON_REPOSITORY
      ]
    },
    { label: 'Badges', link: ['settings', 'badges'] },
    {
      label: 'Autofix settings',
      link: ['settings', 'autofix'],
      perms: [RepoPerms.INSTALL_AUTOFIX_APP, RepoPerms.CREATE_AUTOFIXES]
    },
    { label: 'Ignore rules', link: ['settings', 'ignore-rules'] },
    {
      label: 'SSH access',
      link: ['settings', 'ssh-access'],
      perms: [RepoPerms.GENERATE_SSH_KEY_PAIR]
    },
    { label: 'Reporting', link: ['settings', 'reporting'], perms: [RepoPerms.VIEW_DSN] },
    { label: 'Audit log', link: ['settings', 'audit-log'], perms: [RepoPerms.VIEW_AUDIT_LOGS] },
    {
      label: 'Repository members',
      link: ['settings', 'repo-members'],
      perms: [RepoPerms.UPDATE_ROLE_OF_EXISTING_MEMBERS],
      forTeams: true
    }
  ]

  get isTeamAccount(): boolean {
    if (this.activeDashboardContext && this.activeDashboardContext.type) {
      return this.activeDashboardContext.type !== 'user'
    }
    return true
  }

  mounted(): void {
    this.setAnalysisUpdateEvent()
  }

  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `Settings • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }

  isNavLinkVisible(item: TabLink): boolean {
    if (item.forTeams && !this.isTeamAccount) {
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
