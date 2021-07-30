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
    <div v-if="listLoading" class="flex flex-col space-y-2">
      <div v-for="loader in this.limit" :key="loader" class="flex w-full space-x-2 animate-pulse">
        <div class="w-8 h-8 rounded-md bg-ink-300"></div>
        <div class="w-2/3 h-8 rounded-md bg-ink-300"></div>
        <div class="flex-grow h-8 rounded-md bg-ink-300"></div>
      </div>
    </div>
    <template v-else-if="team.members && team.members.edges && team.members.edges.length">
      <transition-group
        move-class="duration-200 transform"
        tag="ul"
        class="divide-y divide-ink-300"
      >
        <member-list-item
          v-for="member in team.members.edges"
          :key="member.node.id"
          :role="member.node.role"
          :isPrimaryUser="member.node.isPrimaryUser"
          v-bind="member.node.user"
          @updateRole="triggerUpdateRole"
          @removeMember="triggerRemoveMember"
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
    </portal>
  </div>
</template>
<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import TeamDetailMixin from '@/mixins/teamDetailMixin'
import { MemberListItem, UpdateRoleModal, RemoveMemberModal } from '@/components/Members'
import { ZInput, ZIcon, ZPagination } from '@deepsourcelabs/zeal'

import { Maybe, User, UserEdge } from '~/types/types'
import { TeamPerms } from '~/types/permTypes'

@Component({
  components: {
    ZInput,
    ZIcon,
    MemberListItem,
    ZPagination,
    UpdateRoleModal,
    RemoveMemberModal
  },
  middleware: ['teamOnly', 'perm'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.MANAGE_TEAM_MEMEBERS]
    }
  },
  validate({ params }): boolean {
    return ['gh', 'gl', 'bb'].includes(params.provider)
  },
  layout: 'dashboard'
})
export default class Member extends mixins(TeamDetailMixin) {
  private searchCandidate = ''
  private limit = 10
  private currentPage = 1
  public listLoading = false
  public showUpdateRoleModal = false
  public showRemoveMemberModal = false
  public userToUpdate: Record<string, string> = {}

  async fetch(): Promise<void> {
    await this.fetchTeamMembers()
  }

  async searchActiveUsers(): Promise<void> {
    await this.fetchTeamMembers()
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

  async updateRole(email: string, newRole: string): Promise<void> {
    await this.updateMemberRole({
      ownerId: this.team.id,
      role: newRole,
      email
    })

    await this.fetchTeamMembers(true)
    this.closeUpdateRoleModal()
  }

  async removeMember(email: User['email']): Promise<void> {
    await this.removeMemberFromTeam({
      ownerId: this.team.id,
      email
    })
    await this.fetchTeamMembers(true)
    this.closeRemoveMemberModal()
  }

  closeUpdateRoleModal(): void {
    this.showUpdateRoleModal = false
  }

  closeRemoveMemberModal(): void {
    this.showRemoveMemberModal = false
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
