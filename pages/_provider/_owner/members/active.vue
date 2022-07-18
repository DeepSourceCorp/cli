<template>
  <div class="space-y-4">
    <div class="flex space-x-2">
      <z-input
        v-model="searchCandidate"
        icon="search"
        class="p-2"
        :showBorder="false"
        backgroundColor="ink-300"
        @debounceInput="searchActiveUsers"
        placeholder="Search for team member"
      >
        <template slot="left">
          <z-icon icon="search" class="ml-1.5" size="small"></z-icon>
        </template>
      </z-input>
    </div>
    <div v-if="listLoading" class="flex flex-col space-y-2.5">
      <div
        v-for="loader in this.limit"
        :key="loader"
        class="flex w-full py-1 space-x-4 animate-pulse"
      >
        <div class="rounded-full w-9 h-9 bg-ink-300"></div>
        <div class="w-1/3 h-10 rounded-md bg-ink-300"></div>
        <div class="w-1/3 h-10 rounded-md bg-ink-300"></div>
        <div class="flex-grow h-10 rounded-md bg-ink-300"></div>
      </div>
    </div>
    <template v-else-if="teamMembersList && teamMembersList.length">
      <transition-group
        move-class="duration-200 transform"
        tag="ul"
        class="divide-y divide-ink-300"
      >
        <member-list-item
          v-for="member in teamMembersList"
          :key="member.id"
          :role="member.role"
          :is-primary-user="member.isPrimaryUser"
          :allow-transfer="allowTransfer"
          v-bind="member.user"
          @updateRole="triggerUpdateRole"
          @removeMember="triggerRemoveMember"
          @transferOwnership="triggerTransferOwnership"
        />
      </transition-group>
      <z-pagination
        v-if="totalPages"
        class="flex justify-center"
        :totalPages="totalPages"
        :totalVisible="5"
        :hideForSinglePage="true"
        v-model="currentPage"
      ></z-pagination>
    </template>
    <portal to="modal">
      <update-role-modal
        v-if="showUpdateRoleModal"
        @close="closeUpdateRoleModal"
        @primaryAction="updateRole"
        v-bind="userToUpdate"
        :showModal="showUpdateRoleModal"
      ></update-role-modal>
      <remove-member-modal
        v-if="showRemoveMemberModal"
        @close="closeRemoveMemberModal"
        @primaryAction="removeMember"
        v-bind="userToUpdate"
        :showModal="showRemoveMemberModal"
      ></remove-member-modal>
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
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import TeamDetailMixin from '@/mixins/teamDetailMixin'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'
import {
  MemberListItem,
  UpdateRoleModal,
  RemoveMemberModal,
  TransferOwnershipModal
} from '@/components/Members'
import { ZInput, ZIcon, ZPagination } from '@deepsourcelabs/zeal'

import { User, TeamMember } from '~/types/types'
import { TeamPerms } from '~/types/permTypes'
import { resolveNodes } from '~/utils/array'

@Component({
  components: {
    ZInput,
    ZIcon,
    MemberListItem,
    ZPagination,
    UpdateRoleModal,
    RemoveMemberModal,
    TransferOwnershipModal
  },
  middleware: ['teamOnly', 'perm', 'validateProvider'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.MANAGE_TEAM_MEMEBERS]
    }
  },
  layout: 'dashboard'
})
export default class Member extends mixins(TeamDetailMixin, OwnerBillingMixin) {
  private searchCandidate = ''
  private limit = 10
  private currentPage = 1
  public listLoading = false
  public showUpdateRoleModal = false
  public showRemoveMemberModal = false
  public showTransferOwnershipModal = false
  public transferOwnershipSuccessful = false
  public transferInProgress = false
  public userToUpdate: Record<string, string> = {}

  async fetch(): Promise<void> {
    await this.refetchData()
  }

  async refetchData(refetch = false) {
    const { owner, provider } = this.$route.params
    const args = { login: owner, provider, refetch }

    await Promise.all([this.fetchTeamMembers(refetch), this.fetchOwnerDetails(args)])
  }

  async searchActiveUsers(): Promise<void> {
    await this.fetchTeamMembers()
  }

  get teamMembersList(): TeamMember[] {
    return resolveNodes(this.team.members) as TeamMember[]
  }

  get allowTransfer(): boolean {
    return this.team.numMembersTotal ? this.team.numMembersTotal > 1 : false
  }

  @Watch('currentPage')
  async fetchTeamMembers(refetch = false): Promise<void> {
    this.listLoading = true
    const { owner, provider } = this.$route.params
    await this.fetchTeam({
      login: owner,
      provider,
      currentPage: this.currentPage,
      limit: this.limit,
      query: this.searchCandidate,
      refetch
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
    if (this.team?.members?.totalCount) {
      pages = Math.ceil(this.team.members.totalCount / this.limit)
    }
    return pages > 1 ? pages : 0
  }
}
</script>
