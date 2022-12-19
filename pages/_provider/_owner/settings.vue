<template>
  <div class="grid grid-cols-1 lg:grid-cols-16-fr team-level-settings-page">
    <nav
      class="hidden px-4 pt-2 overflow-x-auto border-b gap-x-8 hide-scroll border-ink-200 lg:sticky lg:flex lg:flex-col lg:gap-y-1 lg:p-2 lg:border-r vertical-sidebar"
    >
      <template v-for="option in settingsOptions">
        <!-- Show skeleton loader if `dashboardContext` is not populated yet -->
        <div
          v-if="showSkeletonLoaders"
          :key="option.label"
          class="animate-pulse h-9 bg-ink-300"
        ></div>

        <nuxt-link
          v-else-if="isTeam && option.validator"
          :to="getRoute(option.name)"
          :key="option.label"
          class="flex-shrink-0 text-sm rounded-md group hover:bg-ink-300"
        >
          <span
            class="hidden p-2 rounded-md group-hover:text-vanilla-100 lg:block"
            :class="
              $route && $route.name && $route.name.startsWith(option.routeName)
                ? 'bg-ink-300 text-vanilla-100'
                : 'text-vanilla-400'
            "
            >{{ option.label }}</span
          >
        </nuxt-link>
      </template>
    </nav>

    <!-- Child view -->
    <nuxt-child class="mb-28 lg:mb-0" />

    <floating-button-mobile :nav-items="navItemsForMobile" />
  </div>
</template>
<script lang="ts">
import { ZTab, ZTag } from '@deepsource/zeal'
import { Context } from '@nuxt/types'
import { Component, mixins } from 'nuxt-property-decorator'

import ActiveUserMixin from '~/mixins/activeUserMixin'

import { AppFeatures, TeamPerms } from '~/types/permTypes'
import { TeamMemberRoleChoices } from '~/types/types'

export interface LinkOptions {
  name: string
  label: string
  icon: string
  routeName: string
  validator: boolean
  isBeta?: boolean
}

@Component({
  components: {
    ZTab,
    ZTag
  },
  layout: 'dashboard',
  middleware: [
    'perm',
    'teamOnly',
    'validateProvider',
    function ({ redirect, route, $config }: Context): void {
      if (route.name === 'provider-owner-settings') {
        const { provider, owner } = route.params
        if ($config.onPrem) {
          redirect(`/${provider}/${owner}/settings/access`)
        } else {
          redirect(`/${provider}/${owner}/settings/preferences`)
        }
      }
    }
  ],
  meta: {
    auth: {
      strict: true,
      teamPerms: [
        TeamPerms.CHANGE_PLAN,
        TeamPerms.UPDATE_SEATS,
        TeamPerms.DELETE_TEAM_ACCOUNT,
        TeamPerms.UPDATE_BILLING_DETAILS,
        TeamPerms.VIEW_ACCESS_CONTROL_DASHBOARD,
        TeamPerms.AUTO_ONBOARD_VIEW_TEMPLATE,
        TeamPerms.GENERATE_OWNER_SSH_KEY_PAIR,
        TeamPerms.AUTO_ONBOARD_CRUD_FOR_TEMPLATE,
        TeamPerms.MANAGE_OWNER_ISSUE_PRIORITY
      ]
    }
  },
  scrollToTop: true
})
export default class TeamSettings extends mixins(ActiveUserMixin) {
  getRoute(candidate: string): string {
    return this.$generateRoute(['settings', candidate])
  }

  get settingsOptions(): LinkOptions[] {
    return [
      {
        name: 'billing',
        label: 'Billing',
        icon: 'credit-card',
        routeName: 'provider-owner-settings-billing',
        validator: this.showBilling
      },
      {
        name: 'preferences',
        label: 'Preferences',
        icon: 'box',
        routeName: 'provider-owner-settings-preferences',
        validator: this.canViewPreferences
      },
      {
        name: 'access',
        label: 'Access control',
        icon: 'z-lock',
        routeName: 'provider-owner-settings-access',
        validator: this.canViewAccessControl
      },
      {
        name: 'ssh-access',
        label: 'SSH access',
        icon: 'key',
        routeName: 'provider-owner-settings-ssh-access',
        validator: this.canGenerateSSHKeyPair
      },
      {
        name: 'auto-onboard',
        label: 'Auto Onboard',
        icon: 'fast-forward',
        routeName: 'provider-owner-settings-auto-onboard',
        validator: this.autoOnboardAvailable
      },
      {
        name: 'webhooks',
        label: 'Webhooks',
        icon: 'corner-up-right',
        routeName: 'provider-owner-settings-webhooks',
        validator: this.webhooksAvailable
      },
      {
        name: 'issue-priority',
        icon: 'flag',
        label: 'Issue priority',
        routeName: 'provider-owner-settings-issue-priority',
        validator: this.issuePriorityAvailable
      },
      {
        name: 'integrations',
        icon: 'list',
        label: 'Integrations',
        routeName: 'provider-owner-settings-integrations',
        validator: this.canViewIntegrations
      }
    ]
  }

  get showBilling(): boolean {
    if (this.$config.onPrem) {
      return false
    }

    if ('type' in this.activeDashboardContext) {
      if (this.activeDashboardContext.type === 'user') {
        return false
      }
      const role = this.activeDashboardContext.role as TeamMemberRoleChoices
      return this.$gateKeeper.team(
        [TeamPerms.CHANGE_PLAN, TeamPerms.UPDATE_SEATS, TeamPerms.UPDATE_BILLING_DETAILS],
        role
      )
    }
    return false
  }

  /**
   * Mounted hook
   *
   * @returns {void}
   */
  mounted(): void {
    this.$nextTick(() => {
      this.setCommands()
    })
  }

  get autoOnboardAvailable(): boolean {
    const { provider } = this.$route.params
    return (
      this.$gateKeeper.provider(AppFeatures.AUTO_ONBOARD, provider) &&
      this.isTeam &&
      this.$gateKeeper.team(TeamPerms.AUTO_ONBOARD_REPOSITORIES, this.teamPerms.permission)
    )
  }

  get webhooksAvailable(): boolean {
    return (
      this.isTeam && this.$gateKeeper.team(TeamPerms.MANAGE_WEBHOOKS, this.teamPerms.permission)
    )
  }

  get issuePriorityAvailable(): boolean {
    return (
      this.isTeam &&
      this.$gateKeeper.team(TeamPerms.MANAGE_OWNER_ISSUE_PRIORITY, this.teamPerms.permission)
    )
  }

  get canViewAccessControl(): boolean {
    return this.$gateKeeper.team(TeamPerms.VIEW_ACCESS_CONTROL_DASHBOARD, this.teamPerms.permission)
  }

  get canGenerateSSHKeyPair(): boolean {
    return this.$gateKeeper.team(TeamPerms.GENERATE_OWNER_SSH_KEY_PAIR, this.teamPerms.permission)
  }

  get canViewIntegrations(): boolean {
    return (
      this.isTeam && this.$gateKeeper.team(TeamPerms.MANAGE_INTEGRATIONS, this.teamPerms.permission)
    )
  }

  get canViewPreferences(): boolean {
    return this.$gateKeeper.team(TeamPerms.MANAGE_PREFERENCES, this.teamPerms.permission)
  }

  get isTeam(): boolean {
    return this.activeDashboardContext.type === 'team'
  }

  get navItemsForMobile() {
    const visibleNavItems = this.settingsOptions.filter((item) => this.isTeam && item.validator)

    return visibleNavItems.map((item) => {
      return {
        label: item.label,
        routePath: this.getRoute(item.name)
      }
    })
  }

  get showSkeletonLoaders(): boolean {
    return !this.viewer.dashboardContext?.length
  }

  /**
   * Set meta info for the settings page.
   */
  head(): Record<string, string> {
    const { owner } = this.$route.params
    return {
      title: `Settings • ${owner}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }

  /**
   * Set commands for current context
   *
   *  @return {void}
   */
  setCommands(): void {
    const { owner } = this.$route.params

    this.$palette.registerCommands(
      this.settingsOptions
        .filter((opt) => opt.validator)
        .map((opt) => {
          return {
            id: `open-${opt.routeName}-settings`,
            label: opt.label,
            labelHTML: `<span class="text-vanilla-400">Settings</span> / ${opt.label}`,
            hint: `${owner}`,
            icon: opt.icon,
            scope: 'owner',
            condition: (route) => {
              if (this.isTeam) {
                return route.name?.startsWith('provider-owner-settings') ?? false
              }
              return false
            },
            action: () => {
              this.$router.push(this.$generateRoute(['settings', opt.name], false))
            }
          }
        }),
      this.$route.name ?? ''
    )
  }
}
</script>

<style scoped>
.team-level-settings-page {
  /* The dashboard header comprising of the team avatar, VCS icon, etc. */
  --dashboard-header-height: 53px;

  /* The horizontal navbar as part of `dashboard`` layout */
  --horizontal-navbar-height: 44.5px;

  /* The vertical sidebar top position would be the sum of aforementioned values */
  --vertical-sidebar-top-offset: calc(
    var(--dashboard-header-height) + var(--horizontal-navbar-height)
  );
}

@media screen and (min-width: 1024px) {
  .vertical-sidebar {
    top: var(--vertical-sidebar-top-offset);
    height: calc(100vh - var(--vertical-sidebar-top-offset));
  }
}
</style>
