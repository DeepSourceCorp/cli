<template>
  <div>
    <div class="overflow-x-scroll border-b bg-ink-300 border-ink-200">
      <div id="header" class="flex items-center p-4">
        <h2 class="inline-flex items-center space-x-3 font-medium text-vanilla-100">
          <nuxt-link
            class="inline-flex items-center flex-shrink-0 space-x-2"
            :to="$generateRoute()"
          >
            <!-- account avatar -->
            <z-avatar
              v-if="activeDashboardContext.avatar_url"
              :image="activeDashboardContext.avatar_url"
              :user-name="activeDashboardContext.login"
              class="flex-shrink-0"
            ></z-avatar>

            <!-- account display name -->
            <span class="text-xl font-semibold cursor-pointer lg:text-xl xl:text-2xl">{{
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
            <z-tag
              v-if="hasPaidPlan"
              class="leading-none text-center border border-ink-100 cursor"
              spacing="py-1.5 px-3"
              bgColor="ink-200"
              v-tooltip="`This account is on the ${planName} plan`"
              >{{ planName }}</z-tag
            >
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
    return ['github enterprise', 'github_enterprise', 'github-enterprise'].includes(provider)
      ? 'github'
      : provider
  }
}
</script>
