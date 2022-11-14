<template>
  <div class="space-y-4">
    <template v-if="team.invites.edges.length > 0">
      <transition-group class="duration-200 transform" tag="ul">
        <invited-member-list-item
          v-for="invite in team.invites.edges"
          :key="invite.node.email"
          v-bind="invite.node"
          @cancelInvite="confirmCancelInvite"
        >
        </invited-member-list-item>
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
    <div v-else-if="$fetchState.pending" class="flex flex-col space-y-2">
      <div
        v-for="loader in Array.from(Array(this.limit).keys())"
        :key="loader"
        class="flex w-full space-x-2 animate-pulse"
      >
        <div class="w-8 h-8 rounded-md bg-ink-300"></div>
        <div class="w-2/3 h-8 rounded-md bg-ink-300"></div>
        <div class="flex-grow h-8 rounded-md bg-ink-300"></div>
      </div>
    </div>
    <empty-state
      v-else
      :webp-image-path="require('~/assets/images/ui-states/pending-invites-136px.webp')"
      :png-image-path="require('~/assets/images/ui-states/pending-invites-136px.png')"
      :show-border="true"
      title="No pending invites"
      subtitle="Looks like all your invitations have been accepted. Go ahead and invite someone new!"
    >
    </empty-state>
    <portal to="modal">
      <z-confirm v-if="showCancelConfirm" @primaryAction="cancelInviteForMember" @onClose="close">
        <div class="flex items-center mb-2 text-base leading-relaxed text-vanilla-100">
          <z-icon icon="alert-circle" size="small" class="mr-2"></z-icon>
          Do you want to cancel this invite?
        </div>
        <p class="text-sm leading-relaxed text-vanilla-400">
          The invitation link sent via email would become invalid.
          <b class="text-vanilla-100">This action cannot be reversed.</b>
        </p>
        <template slot="footer">
          <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
            <z-button buttonType="ghost" class="text-vanilla-100" size="small" @click="close"
              >Cancel</z-button
            >
            <z-button
              buttonType="danger"
              size="small"
              @click="cancelInviteForMember"
              class="inline-flex space-x-1.5 items-center"
            >
              <z-icon
                v-if="inviteLoading"
                icon="spin-loader"
                class="animate-spin"
                color="ink-400"
              ></z-icon>
              <z-icon v-else icon="trash-2" color="ink-400" class="mb-0.5"></z-icon>
              <span v-if="inviteLoading"> Cancelling Invite </span>
              <span v-else> Yes, cancel invite </span>
            </z-button>
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>
<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import TeamDetailMixin from '@/mixins/teamDetailMixin'
import { InvitedMemberListItem, UpdateRoleModal, RemoveMemberModal } from '@/components/Members'
import {
  ZInput,
  ZButton,
  ZIcon,
  ZMenu,
  ZMenuItem,
  ZMenuSection,
  ZAvatar,
  ZPagination,
  ZConfirm
} from '@deepsourcelabs/zeal'
import { TeamPerms } from '~/types/permTypes'

@Component({
  components: {
    ZInput,
    ZButton,
    ZIcon,
    ZMenu,
    ZMenuItem,
    ZMenuSection,
    ZAvatar,
    InvitedMemberListItem,
    ZPagination,
    ZConfirm,
    UpdateRoleModal,
    RemoveMemberModal
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
export default class Invited extends mixins(TeamDetailMixin) {
  private currentPage = 1
  private limit = 10
  private invitedEmailToCancel = ''
  public showCancelConfirm = false
  public inviteLoading = false

  async fetch(): Promise<void> {
    await this.fetchTeamMembers()
  }

  @Watch('currentPage')
  async fetchTeamMembers(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchInvitedUsers({
      login: owner,
      provider,
      currentPage: this.currentPage,
      limit: this.limit
    })
  }

  get totalPages(): number {
    let pages = 0
    if (this.team.invites?.totalCount) {
      pages = Math.ceil(this.team.invites?.totalCount / this.limit) || 0
    }
    return pages > 1 ? pages : 0
  }

  confirmCancelInvite(email: string): void {
    this.invitedEmailToCancel = email
    this.showCancelConfirm = true
  }

  close(): void {
    this.showCancelConfirm = false
    this.inviteLoading = false
  }

  async cancelInviteForMember(): Promise<void> {
    this.inviteLoading = true
    const { owner, provider } = this.$route.params

    await this.cancelInvite({
      ownerId: this.team.id,
      email: this.invitedEmailToCancel,
      login: owner,
      provider,
      currentPage: this.currentPage,
      limit: this.limit
    })

    this.close()
    this.$toast.success(`Invitation sent to ${this.invitedEmailToCancel} has been cancelled`)
    this.invitedEmailToCancel = ''
  }
}
</script>
