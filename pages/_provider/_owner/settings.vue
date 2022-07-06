<template>
  <div>
    <div id="tabs" class="flex xl:col-span-2 pt-2.5 pb-0 border-b border-ink-200">
      <div class="flex self-end px-2 space-x-5 overflow-auto md:px-4 flex-nowrap">
        <template v-for="settings in settingsOptions">
          <nuxt-link
            v-if="owner.isTeam && settings.validator"
            :key="settings.name"
            :to="getRoute(settings.name)"
          >
            <z-tab
              class="flex items-center space-x-1"
              :class="settings.isBeta ? 'pb-2.5' : ''"
              :isActive="$route && $route.name && $route.name.startsWith(settings.routeName)"
              border-active-color="vanilla-400"
            >
              <span>
                {{ settings.label }}
              </span>
              <z-tag
                v-if="settings.isBeta"
                :bgColor="
                  $route && $route.name && $route.name.startsWith(settings.routeName)
                    ? 'ink-200'
                    : 'ink-200 opacity-50'
                "
                textSize="xxs"
                spacing="px-2 py-1"
                class="font-semibold leading-none tracking-wider text-current uppercase"
              >
                Beta
              </z-tag>
            </z-tab>
          </nuxt-link>
        </template>
      </div>
    </div>
    <nuxt-child></nuxt-child>
  </div>
</template>
<script lang="ts">
import { ZTab, ZTag } from '@deepsourcelabs/zeal'
import { Context } from '@nuxt/types'
import { Component, mixins } from 'nuxt-property-decorator'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import TeamDetailMixin from '~/mixins/teamDetailMixin'

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
          redirect(`/${provider}/${owner}/settings/billing`)
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
        TeamPerms.MANAGE_OWNER_ISSUE_PRIORITY,
        TeamPerms.VIEW_REPORTS
      ]
    }
  }
})
export default class TeamSettings extends mixins(
  TeamDetailMixin,
  OwnerDetailMixin,
  ActiveUserMixin
) {
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
        icon: 'lock',
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
      },
      {
        name: 'reports',
        icon: 'pie-chart',
        label: 'Reports',
        routeName: 'provider-owner-settings-reports',
        validator: this.canViewReports
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
   * Fetch hook
   *
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    const params = {
      login: owner,
      provider
    }
    await this.fetchOwnerDetails(params)
    await this.fetchTeamSettings(params)
  }

  /**
   * Mounted hook
   *
   * @return {void}
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
      this.activeDashboardContext.type === 'team' &&
      this.$gateKeeper.team(TeamPerms.AUTO_ONBOARD_REPOSITORIES, this.teamPerms.permission)
    )
  }

  get webhooksAvailable(): boolean {
    return (
      this.activeDashboardContext.type === 'team' &&
      this.$gateKeeper.team(TeamPerms.MANAGE_WEBHOOKS, this.teamPerms.permission)
    )
  }

  get issuePriorityAvailable(): boolean {
    return (
      this.activeDashboardContext.type === 'team' &&
      this.$gateKeeper.team(TeamPerms.MANAGE_OWNER_ISSUE_PRIORITY, this.teamPerms.permission)
    )
  }

  get canViewAccessControl(): boolean {
    return this.$gateKeeper.team(TeamPerms.VIEW_ACCESS_CONTROL_DASHBOARD, this.teamPerms.permission)
  }

  get canViewReports(): boolean {
    return (
      this.$gateKeeper.team(TeamPerms.VIEW_REPORTS, this.teamPerms.permission) &&
      Boolean(this.viewer.isBetaTester)
    )
  }

  get canGenerateSSHKeyPair(): boolean {
    return this.$gateKeeper.team(TeamPerms.GENERATE_OWNER_SSH_KEY_PAIR, this.teamPerms.permission)
  }

  get canViewIntegrations(): boolean {
    // Disable on prem
    if (this.$config.onPrem) {
      return false
    }

    return (
      this.activeDashboardContext.type === 'team' &&
      this.$gateKeeper.team(TeamPerms.MANAGE_INTEGRATIONS, this.teamPerms.permission)
    )
  }

  get canViewPreferences(): boolean {
    return this.$gateKeeper.team(TeamPerms.MANAGE_PREFERNCES, this.teamPerms.permission)
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
            label: `<span class="text-vanilla-400">Settings</span> / ${opt.label}`,
            hint: `${owner}`,
            icon: opt.icon,
            scope: 'owner',
            condition: (route) => {
              if (this.activeDashboardContext.type === 'team') {
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
