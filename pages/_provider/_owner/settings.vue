<template>
  <div>
    <div id="tabs" class="flex xl:col-span-2 pt-2.5 pb-0 border-b border-ink-200">
      <div class="flex self-end px-2 md:px-4 space-x-5 overflow-auto flex-nowrap">
        <nuxt-link v-if="owner.isTeam && showBilling" :to="getRoute('billing')">
          <z-tab
            :isActive="$route.name.startsWith('provider-owner-settings-billing')"
            border-active-color="vanilla-400"
            >Billing</z-tab
          >
        </nuxt-link>
        <nuxt-link v-if="owner.isTeam" :to="getRoute('access')">
          <z-tab
            :isActive="$route.name.startsWith('provider-owner-settings-access')"
            border-active-color="vanilla-400"
            >Access control</z-tab
          >
        </nuxt-link>
      </div>
    </div>
    <nuxt-child></nuxt-child>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { Context } from '@nuxt/types'
import { ZTab } from '@deepsourcelabs/zeal'
import TeamDetailMixin from '~/mixins/teamDetailMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { TeamPerms } from '~/types/permTypes'
import { TeamMemberRoleChoices } from '~/types/types'

@Component({
  components: {
    ZTab
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
        TeamPerms.VIEW_ACCESS_CONTROL_DASHBOARD
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

  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    const params = {
      login: owner,
      provider
    }
    await this.fetchOwnerDetails(params)
    await this.fetchTeamSettings(params)
  }

  head(): Record<string, string> {
    const { owner } = this.$route.params
    return {
      title: `Settings • ${owner}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
