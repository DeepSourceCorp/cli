<template>
  <div>
    <div class="bg-ink-300 border-b border-ink-200">
      <div id="header" class="p-4">
        <h2 class="inline-flex items-center space-x-3 mr-3 font-medium text-vanilla-100">
          <nuxt-link class="inline-flex items-center space-x-2" :to="$generateRoute()">
            <!-- account avatar -->
            <z-avatar
              v-if="activeDashboardContext.avatar_url"
              :image="activeDashboardContext.avatar_url"
              :user-name="activeDashboardContext.login"
            ></z-avatar>

            <!-- account display name -->
            <span class="cursor-pointer text-xl lg:text-xl xl:text-2xl font-semibold">{{
              activeDashboardContext.team_name || activeDashboardContext.login
            }}</span>
          </nuxt-link>

          <!-- account VCS avatar, linked to the VCS org page -->
          <a
            :href="activeDashboardContext.vcs_url"
            target="_blank"
            rel="noopener noreferrer"
            v-tooltip="
              `Open ${activeDashboardContext.login} on ${activeDashboardContext.vcs_provider_display}`
            "
          >
            <z-tag
              v-if="activeDashboardContext.vcs_provider_display"
              class="border-2 border-ink-200"
              spacing="p-0.5"
              bgcolor="ink-200"
              size="base"
              :iconLeft="activeDashboardContext.vcs_provider_display.toLowerCase()"
            ></z-tag>
          </a>

          <template v-if="!context.on_prem && activeDashboardContext.type === 'team'">
            <z-tag
              v-if="hasPaidPlan"
              class="border-ink-100 border text-center cursor leading-none"
              spacing="py-1.5 px-3"
              bgColor="ink-200"
              v-tooltip="`This account is on the ${planName} plan`"
              >{{ planName }}</z-tag
            >
            <nuxt-link v-else-if="!$config.onPrem" :to="$generateRoute(['settings', 'billing'])">
              <z-tag
                icon-left="star"
                class="border-ink-100 border text-center leading-none uppercase font-semibold tracking-wider text-vanilla-300 hover:text-vanilla-100 hover:bg-ink-100"
                spacing="py-1.5 px-3"
                bgColor="ink-200"
                v-tooltip="'See upgrade options'"
              >
                <span>Upgrade</span></z-tag
              >
            </nuxt-link>
          </template>
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

const FREE_PLAN_SLUG = 'free'

@Component({
  components: {
    ZIcon,
    ZTag,
    ZAvatar,
    ZAvatarGroup
  }
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

  get repoVCSIcon(): string {
    const provider = this.activeDashboardContext.vcs_provider_display.toLowerCase()
    return ['github_enterprise', 'github-enterprise'].includes(provider) ? 'github' : provider
  }
}
</script>
