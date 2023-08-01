<template>
  <div class="space-y-4">
    <admin-notices v-if="showNotice" :type="notice" @dismiss="hideNotice" />
    <div v-if="listLoading">
      <member-list-item-loading
        v-for="loader in limit"
        :key="loader"
        :hide-border="loader === limit"
        class="first:pt-0"
      />
    </div>
    <template v-else-if="teamMembersList && teamMembersList.length">
      <transition-group move-class="duration-200 transform" tag="ul">
        <member-list-item
          v-for="(member, index) in teamMembersList"
          :key="member.id"
          :role="member.role"
          :is-perm-from-vcs="member.isRoleFromVcs"
          :is-primary-user="member.isPrimaryUser"
          :team-avatar-url="owner.avatar"
          :allow-transfer="allowTransfer"
          :login="$route.params.owner"
          :vcs-provider="$route.params.provider"
          :hide-border="index === teamMembersList.length - 1"
          :show-role-options="canManageMembers"
          account-type="team"
          v-bind="member.user"
          :class="{ '-mt-4': index === 0 }"
          @updateRole="triggerUpdateRole"
          @removeMember="triggerRemoveMember"
          @transferOwnership="triggerTransferOwnership"
        />
      </transition-group>
      <z-pagination
        v-if="totalPages"
        v-model="currentPage"
        class="flex justify-center"
        :total-pages="totalPages"
        :total-visible="5"
        :hide-for-single-page="true"
      />
    </template>
    <empty-state
      v-else
      :title="`No results found for '${searchCandidate}'`"
      :svg-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
      :show-border="true"
      subtitle="Please try changing your search query."
    />

    <portal to="modal">
      <update-role-modal
        v-if="showUpdateRoleModal"
        v-bind="userToUpdate"
        :show-modal="showUpdateRoleModal"
        @close="closeUpdateRoleModal"
        @primaryAction="updateRole"
      />
      <remove-member-modal
        v-if="showRemoveMemberModal"
        v-bind="userToUpdate"
        :show-modal="showRemoveMemberModal"
        @close="closeRemoveMemberModal"
        @primaryAction="removeMember"
      />
      <transfer-ownership-modal
        v-if="showTransferOwnershipModal"
        v-bind="userToUpdate"
        :show-modal="showTransferOwnershipModal"
        :members="teamMembersList"
        :transfer-success="transferOwnershipSuccessful"
        :transfer-loading="transferInProgress"
        @close="closeTransferOwnershipModal"
        @primaryAction="transferTeamOwnership"
      />
    </portal>
  </div>
</template>
<script lang="ts">
import { Component, Watch, mixins, Prop } from 'nuxt-property-decorator'
import TeamDetailMixin from '@/mixins/teamDetailMixin'
import PlanDetailMixin from '~/mixins/planDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import {
  MemberListItem,
  UpdateRoleModal,
  RemoveMemberModal,
  TransferOwnershipModal
} from '@/components/Members'
import { ZPagination } from '@deepsource/zeal'

import MemberRoleCountQuery from '@/apollo/queries/team/memberRoleCount.gql'
import { User, TeamMember } from '~/types/types'
import { TeamPerms } from '~/types/permTypes'
import { resolveNodes } from '~/utils/array'
import { AdminNoticeTypes } from '~/components/Members/AdminNotices.vue'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

/**
 * Active team members page
 */
@Component({
  components: {
    ZPagination,
    MemberListItem,
    UpdateRoleModal,
    RemoveMemberModal,
    TransferOwnershipModal
  },
  middleware: ['teamOnly', 'perm', 'validateProvider'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.VIEW_TEAM_MEMBERS]
    }
  },
  layout: 'dashboard'
})
export default class ActiveMembers extends mixins(
  TeamDetailMixin,
  PlanDetailMixin,
  ActiveUserMixin
) {
  @Prop({ type: String, default: '' })
  searchCandidate: string

  private limit = 20
  private currentPage = 1
  public listLoading = false
  public showUpdateRoleModal = false
  public showRemoveMemberModal = false
  public showTransferOwnershipModal = false
  public transferOwnershipSuccessful = false
  public transferInProgress = false
  public userToUpdate: Record<string, string> = {}
  // ? `-1` as default since `0` is a valid value for admin count
  // ? Although logically it will never be `0` unless something goes bad on asgard end
  adminCount = -1

  async fetchRoleCount(refetch = false) {
    const { owner, provider } = this.$route.params

    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        MemberRoleCountQuery,
        {
          login: owner,
          provider: this.$providerMetaMap[provider].value
        },
        refetch
      )

      // @ts-expect-error - Using an alias
      const adminCount = response.data.team?.adminCount?.totalCount
      if (Number.isSafeInteger(adminCount)) {
        this.adminCount = adminCount
      }
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'An error occured while fetching member information.')
    }
  }

  async fetch(): Promise<void> {
    await this.refetchData()

    const { owner, provider } = this.$route.params
    if (
      this.$gateKeeper.team(
        [TeamPerms.CHANGE_PLAN, TeamPerms.UPDATE_SEATS],
        this.teamPerms.permission
      )
    ) {
      this.fetchBillingDetails({ login: owner, provider })
    }
  }

  async refetchData(refetch = false) {
    const { owner, provider } = this.$route.params
    const args = { login: owner, provider, refetch }

    await Promise.all([
      this.fetchTeamMembers(),
      this.fetchOwnerDetails(args),
      this.fetchRoleCount(refetch)
    ])
  }

  @Watch('searchCandidate')
  async searchActiveUsers(): Promise<void> {
    await this.fetchTeamMembers()
  }

  get notice(): AdminNoticeTypes {
    if (this.$gateKeeper.team(TeamPerms.CHANGE_PLAN, this.teamPerms.permission)) {
      // Only compare actual numerical values and not `undefined === undefined`, etc
      const isPlanMaxedOut =
        Number(this.ownerBillingInfo.seatsUsed) === Number(this.currentPlan.max_seats)
      if (isPlanMaxedOut) {
        const hasPlanUpgrade = Object.keys(this.availableUpgradePlans).length > 0
        return hasPlanUpgrade ? AdminNoticeTypes.upgradePlan : AdminNoticeTypes.enterprise
      }
    }

    if (this.$gateKeeper.team(TeamPerms.UPDATE_SEATS, this.teamPerms.permission)) {
      // Only compare actual numerical values and not `undefined === undefined`, etc
      const isOutOfSeats =
        Number(this.ownerBillingInfo.seatsUsed) === Number(this.ownerBillingInfo.seatsTotal)
      if (isOutOfSeats) {
        return AdminNoticeTypes.addMoreSeats
      }
    }

    if (this.adminCount === 1) {
      return AdminNoticeTypes.oneAdmin
    }

    return -1
  }

  hideNotice(noticeType: AdminNoticeTypes) {
    this.$localStore.set(
      'owner-members',
      `hide-notice-${this.owner.login ?? this.team.id}-${noticeType}`,
      true
    )
  }

  get showNotice() {
    const CLIENT_SIDE_NOTICES = [AdminNoticeTypes.oneAdmin]
    if (CLIENT_SIDE_NOTICES.includes(this.notice)) {
      if (process.client) {
        const isNoticeHidden = this.$localStore.get(
          'owner-members',
          `hide-notice-${this.owner.login ?? this.team.id}-${this.notice}`
        )

        return !isNoticeHidden
      }
    } else {
      return this.notice > -1
    }
  }

  get canManageMembers() {
    return this.$gateKeeper.team(TeamPerms.MANAGE_TEAM_MEMBERS, this.teamPerms.permission)
  }

  get teamMembersList(): TeamMember[] {
    return resolveNodes(this.team.teamMembers)
  }

  get allowTransfer(): boolean {
    return this.team.numMembersTotal ? this.team.numMembersTotal > 1 : false
  }

  @Watch('currentPage')
  async fetchTeamMembers(): Promise<void> {
    this.listLoading = true
    const { owner, provider } = this.$route.params
    await this.fetchTeam({
      login: owner,
      provider,
      currentPage: this.currentPage,
      limit: this.limit,
      query: this.searchCandidate,
      refetch: true
    })
    this.listLoading = false
  }

  triggerUpdateRole(user: Record<string, string>): void {
    this.userToUpdate = user
    this.showUpdateRoleModal = true
  }

  triggerRemoveMember(user: Record<string, string>): void {
    this.userToUpdate = user
    this.showRemoveMemberModal = true
  }

  triggerTransferOwnership(user: Record<string, string>): void {
    this.userToUpdate = user
    this.showTransferOwnershipModal = true
  }

  async updateRole(email: string, newRole: string): Promise<void> {
    await this.updateMemberRole({
      ownerId: this.team.id,
      role: newRole,
      email
    })

    await this.refetchData(true)
    this.closeUpdateRoleModal()
  }

  async removeMember(email: User['email']): Promise<void> {
    await this.removeMemberFromTeam({
      ownerId: this.team.id,
      email
    })
    await this.refetchData(true)
    this.closeRemoveMemberModal()

    // Emit an event to the event bus instructing the Avatar stack in the dashboard header
    // to fetch from the network
    // TODO: Enable once the avatar sizing inconsistency is fixed
    // this.$root.$emit('fetch-members-base-details')
  }

  async transferTeamOwnership(newOwnerId: User['id'], updateBillingEmail: boolean): Promise<void> {
    this.transferInProgress = true
    const success = await this.transferOwnership({
      teamId: this.team.id,
      newPrimaryUserId: newOwnerId,
      updateBillingEmail
    })

    this.transferInProgress = false

    this.transferOwnershipSuccessful = success
    if (success) await this.refetchData(true)
  }

  closeUpdateRoleModal(): void {
    this.showUpdateRoleModal = false
  }

  closeRemoveMemberModal(): void {
    this.showRemoveMemberModal = false
  }

  closeTransferOwnershipModal(): void {
    this.showTransferOwnershipModal = false
  }

  get totalPages(): number {
    let pages = 0
    if (this.team?.teamMembers?.totalCount) {
      pages = Math.ceil(this.team.teamMembers.totalCount / this.limit)
    }
    return pages > 1 ? pages : 0
  }
}
</script>
