<template>
  <div class="overflow-x-auto border-b border-slate-400 bg-ink-300">
    <div id="header" class="flex items-center gap-x-3 p-3">
      <h2 class="inline-flex items-center gap-x-3 font-medium text-vanilla-100">
        <nuxt-link :to="$generateRoute()" class="inline-flex flex-shrink-0 items-center gap-x-2">
          <client-only>
            <z-avatar
              v-if="activeDashboardContext.avatar_url"
              :image="activeDashboardContext.avatar_url"
              :user-name="activeDashboardContext.login"
              :fallback-image="
                getDefaultAvatar(
                  activeDashboardContext.login,
                  activeDashboardContext.type === 'user'
                )
              "
              size="sm"
              stroke="bg-ink-100 p-0.5"
              class="flex-shrink-0"
            />
            <template #placeholder>
              <div class="h-7 w-7 animate-pulse rounded-full bg-ink-200"></div>
            </template>
          </client-only>
          <span class="cursor-pointer text-base font-medium">{{
            activeDashboardContext.team_name || activeDashboardContext.login
          }}</span>
        </nuxt-link>
      </h2>

      <!-- account VCS avatar, linked to the VCS org page -->
      <span class="inline-flex items-center space-x-3">
        <a
          v-tooltip="
            `Open ${activeDashboardContext.login} on ${activeDashboardContext.vcs_provider_display}`
          "
          :href="activeDashboardContext.vcs_url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex h-6 items-center"
        >
          <z-tag
            v-if="activeDashboardContext.vcs_provider"
            :icon-left="repoVCSIcon"
            spacing="p-0.5"
            bg-color="ink-200"
            class="border border-slate-400"
          />
        </a>
        <component
          :is="canVisitBillingPage ? 'nuxt-link' : 'span'"
          v-if="
            !$config.onPrem &&
            activeDashboardContext.type === 'team' &&
            (hasPaidPlan || canVisitBillingPage)
          "
          :to="canVisitBillingPage ? $generateRoute(['settings', 'billing']) : false"
        >
          <z-tag
            v-if="hasPaidPlan"
            v-tooltip="`This account is on the ${planName} plan`"
            icon-left="zap"
            size="x-small"
            bg-color="ink-200"
            spacing="px-2.5"
            text-size="xs"
            class="gap-x-1 border border-slate-400 py-1 font-medium leading-none"
          >
            {{ planName }}
          </z-tag>
          <z-tag
            v-else-if="canVisitBillingPage"
            v-tooltip="'See upgrade options'"
            icon-left="star"
            bg-color="ink-200"
            spacing="px-2.5"
            text-size="xs"
            class="h-6 border border-slate-400 text-center font-semibold uppercase leading-none tracking-wider text-vanilla-300 hover:bg-ink-100 hover:text-vanilla-100"
          >
            <span>Upgrade</span>
          </z-tag>
        </component>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'
import AuthMixin from '~/mixins/authMixin'
import { TeamPerms } from '~/types/permTypes'
import { getDefaultAvatar } from '~/utils/ui'

const FREE_PLAN_SLUG = 'free'

@Component({
  methods: { getDefaultAvatar }
})
export default class DashboardHeader extends mixins(ActiveUserMixin, ContextMixin, AuthMixin) {
  get planName(): string {
    return (this.activeDashboardContext as DashboardContext).subscribed_plan_info?.name
  }

  get hasPaidPlan(): boolean {
    return (
      (this.activeDashboardContext as DashboardContext).subscribed_plan_info?.slug !==
      FREE_PLAN_SLUG
    )
  }

  get canVisitBillingPage(): boolean {
    if (this.teamPerms.permission && this.activeOwner === this.$route.params.owner) {
      return this.$gateKeeper.team(
        [
          TeamPerms.CHANGE_PLAN,
          TeamPerms.UPDATE_SEATS,
          TeamPerms.DELETE_TEAM_ACCOUNT,
          TeamPerms.UPDATE_BILLING_DETAILS
        ],
        this.teamPerms.permission
      )
    }
    return false
  }

  get repoVCSIcon(): string {
    const provider = this.activeDashboardContext.vcs_provider
    return this.$providerMetaMap[provider]?.icon ?? ''
  }
}
</script>
