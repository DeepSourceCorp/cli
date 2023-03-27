<template>
  <div>
    <div class="overflow-x-auto border-b bg-ink-300 border-slate-400">
      <div id="header" class="flex items-center p-3">
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

            <!-- account display name -->
            <span class="text-base font-medium cursor-pointer">{{
              activeDashboardContext.team_name || activeDashboardContext.login
            }}</span>
          </nuxt-link>

          <!-- account VCS avatar, linked to the VCS org page -->
          <span class="inline-flex items-center space-x-3">
            <a
              v-tooltip="
                `Open ${activeDashboardContext.login} on ${activeDashboardContext.vcs_provider_display}`
              "
              :href="activeDashboardContext.vcs_url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center h-6"
            >
              <z-tag
                v-if="activeDashboardContext.vcs_provider_display"
                :icon-left="repoVCSIcon"
                spacing="p-0.5"
                bg-color="ink-200"
                class="border border-slate-400"
              />
            </a>
            <template v-if="!$config.onPrem && activeDashboardContext.type === 'team'">
              <component
                :is="canVisitBillingPage ? 'nuxt-link' : 'span'"
                v-if="hasPaidPlan || canVisitBillingPage"
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
                  class="py-1 gap-x-1 font-medium leading-none border border-slate-400"
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
                  class="h-6 font-semibold leading-none tracking-wider text-center uppercase border border-slate-400 text-vanilla-300 hover:text-vanilla-100 hover:bg-ink-100"
                >
                  <span>Upgrade</span></z-tag
                >
              </component>
            </template>

            <!-- TODO: Enable once the avatar sizing inconsistency is fixed -->
            <!-- <invite-members-modal
              v-if="activeDashboardContext.type === 'team'"
              class="hidden sm:block"
            >
              <template #trigger="{ open }">
                <div
                  role="button"
                  class="flex -space-x-3"
                  v-on="canInviteTeamMembers ? { click: open } : {}"
                >
                  <z-avatar
                    v-for="member in teamMembersList.slice(0, 3)"
                    :key="member.id"
                    :image="member.user.avatar"
                    :fallback-image="getDefaultAvatar(member.user.fullName)"
                    stroke="bg-ink-100 p-0.5"
                    size="sm"
                  />

                  <z-tag
                    v-if="teamMembersCount > 3"
                    bg-color="ink-200"
                    text-size="xxs"
                    spacing="py-1.5 px-2"
                    >+{{ teamMembersCount - 3 }}</z-tag
                  >
                </div>
              </template>
            </invite-members-modal> -->
          </span>
        </h2>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ZAvatar, ZAvatarGroup, ZIcon, ZTag } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

// import TeamMembersBaseDetailsGQLQuery from '~/apollo/queries/team/membersBaseDetails.gql'
import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'
import AuthMixin from '~/mixins/authMixin'
import ContextMixin from '~/mixins/contextMixin'
import { TeamPerms } from '~/types/permTypes'
import { Team } from '~/types/types'
// import { resolveNodes } from '~/utils/array'
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
  teamDetails = {} as Team

  /**
   * The `fetch` hook
   * Fetch team members list for the Avatar stack
   *
   * @returns {Promise<void>}
   */
  // TODO: Enable once the avatar sizing inconsistency is fixed
  // async fetch(): Promise<void> {
  //   if (this.activeDashboardContext.type === 'team') {
  //     await this.fetchMembersBaseDetails(false)
  //   }
  // }

  /**
   * The `mounted` hook
   * Binds listener for the `fetch-members-base-details` event
   *
   * @returns {void}
   */
  // TODO: Enable once the avatar sizing inconsistency is fixed
  // mounted(): void {
  //   this.$root.$on('fetch-members-base-details', this.fetchMembersBaseDetails)
  // }

  /**
   * The `beforeDestroy` hook
   * Unbinds event listener
   *
   * @returns {void}
   */
  // TODO: Enable once the avatar sizing inconsistency is fixed
  // beforeDestroy(): void {
  //   this.$root.$off('fetch-members-base-details', this.fetchMembersBaseDetails)
  // }

  get planName(): string {
    return (this.activeDashboardContext as DashboardContext).subscribed_plan_info?.name
  }

  get hasPaidPlan(): boolean {
    return (
      (this.activeDashboardContext as DashboardContext).subscribed_plan_info?.slug !==
      FREE_PLAN_SLUG
    )
  }

  // TODO: Enable once the avatar sizing inconsistency is fixed
  // get canInviteTeamMembers(): boolean {
  //   return this.$gateKeeper.team(TeamPerms.MANAGE_TEAM_MEMEBERS, this.teamPerms.permission)
  // }

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
    return this.$providerMetaMap[provider].icon ?? ''
  }

  // TODO: Enable once the avatar sizing inconsistency is fixed
  // get teamMembersCount(): number {
  //   return this.teamDetails.members?.totalCount ?? this.teamMembersList.length
  // }

  // get teamMembersList(): TeamMember[] {
  //   return resolveNodes(this.teamDetails.members) as TeamMember[]
  // }

  /**
   * Method to fetch the members base details
   * We're not reusing the `fetchTeamInfo` action from `team/detail` Vuex namespace
   * since searching for a member from the team members page results in a state change
   * affecting the avatar stack
   *
   * @param {boolean} [refetch=true]
   * @returns {Promise<void>}
   */
  // TODO: Enable once the avatar sizing inconsistency is fixed
  // async fetchMembersBaseDetails(refetch = true): Promise<void> {
  //   const { owner: login, provider } = this.$route.params
  //   const {
  //     data: { team }
  //   } = await this.$fetchGraphqlData(
  //     TeamMembersBaseDetailsGQLQuery,
  //     {
  //       provider: this.$providerMetaMap[provider].value,
  //       login,
  //       limit: 3
  //     },
  //     refetch
  //   )

  //   this.teamDetails = team as Team
  // }

  /**
   * Re-fetch the members base details whenever `$route.params.owner` changes
   *
   * @returns {Promise<void>}
   */
  // TODO: Enable once the avatar sizing inconsistency is fixed
  // @Watch('$route.params.owner')
  // async refetchMembersBaseDetails(): Promise<void> {
  //   await this.fetchMembersBaseDetails()
  // }
}
</script>
