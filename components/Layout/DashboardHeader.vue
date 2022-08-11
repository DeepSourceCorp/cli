<template>
  <div>
    <div class="overflow-x-auto border-b bg-ink-300 border-ink-200">
      <div id="header" class="flex items-center p-4">
        <h2 class="inline-flex items-center space-x-4 font-medium text-vanilla-100">
          <nuxt-link
            class="inline-flex items-center flex-shrink-0 space-x-2"
            :to="$generateRoute()"
          >
            <!-- account avatar -->
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
              stroke="bg-ink-100 p-1.5"
              class="flex-shrink-0"
            ></z-avatar>

            <!-- account display name -->
            <span class="text-xl font-semibold cursor-pointer lg:text-xl xl:text-2xl">{{
              activeDashboardContext.team_name || activeDashboardContext.login
            }}</span>
          </nuxt-link>

          <!-- account VCS avatar, linked to the VCS org page -->
          <span class="inline-flex items-center space-x-3">
            <a
              :href="activeDashboardContext.vcs_url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center"
              v-tooltip="
                `Open ${activeDashboardContext.login} on ${activeDashboardContext.vcs_provider_display}`
              "
            >
              <z-tag
                v-if="activeDashboardContext.vcs_provider_display"
                class="border-2 border-ink-200"
                spacing="p-0.5"
                bg-color="ink-200"
                size="base"
                :iconLeft="repoVCSIcon"
              ></z-tag>
            </a>
            <template
              v-if="
                (!context.onPrem || context.onPrem === 'false') &&
                activeDashboardContext.type === 'team'
              "
            >
              <template v-if="hasPaidPlan">
                <nuxt-link v-if="canVisitBillingPage" :to="$generateRoute(['settings', 'billing'])">
                  <z-tag
                    class="leading-none text-center border border-ink-100"
                    spacing="py-1.5 px-3"
                    bgColor="ink-200"
                    v-tooltip="`This account is on the ${planName} plan`"
                    >{{ planName }}</z-tag
                  >
                </nuxt-link>
                <z-tag
                  v-else
                  class="leading-none text-center border border-ink-100 cursor"
                  spacing="py-1.5 px-3"
                  bgColor="ink-200"
                  v-tooltip="`This account is on the ${planName} plan`"
                  >{{ planName }}</z-tag
                >
              </template>
              <nuxt-link v-else-if="!$config.onPrem" :to="$generateRoute(['settings', 'billing'])">
                <z-tag
                  icon-left="star"
                  class="font-semibold leading-none tracking-wider text-center uppercase border border-ink-100 text-vanilla-300 hover:text-vanilla-100 hover:bg-ink-100"
                  spacing="py-1.5 px-3"
                  bgColor="ink-200"
                  v-tooltip="'See upgrade options'"
                >
                  <span>Upgrade</span></z-tag
                >
              </nuxt-link>
            </template>
          </span>
        </h2>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZTag, ZAvatar, ZAvatarGroup } from '@deepsourcelabs/zeal'

import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'
import AuthMixin from '~/mixins/authMixin'
import { TeamPerms } from '~/types/permTypes'
import { getDefaultAvatar } from '~/utils/ui'

const FREE_PLAN_SLUG = 'free'

@Component({
  components: {
    ZIcon,
    ZTag,
    ZAvatar,
    ZAvatarGroup
  },
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
    const provider = this.activeDashboardContext.vcs_provider_display.toLowerCase()
    return ['github enterprise', 'github_enterprise', 'github-enterprise'].includes(provider)
      ? 'github'
      : provider
  }
}
</script>
