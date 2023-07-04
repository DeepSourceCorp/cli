<template>
  <div class="space-y-4">
    <div v-if="$fetchState.pending" class="flex flex-col space-y-2">
      <div
        v-for="loader in Array.from(Array(limit).keys())"
        :key="loader"
        class="flex w-full animate-pulse space-x-2"
      >
        <div class="h-8 w-8 rounded-md bg-ink-300"></div>
        <div class="h-8 w-2/3 rounded-md bg-ink-300"></div>
        <div class="h-8 flex-grow rounded-md bg-ink-300"></div>
      </div>
    </div>

    <template v-else-if="teamInvites.length">
      <transition-group class="transform duration-200" tag="ul">
        <invited-member-list-item
          v-for="invite in teamInvites"
          :key="invite.email"
          v-bind="invite"
          @cancelInvite="confirmCancelInvite"
        />
      </transition-group>
      <z-pagination
        v-if="totalPages > 1"
        v-model="currentPage"
        class="flex justify-center"
        :total-pages="totalPages"
        :total-visible="5"
        :hide-for-single-page="true"
      />
    </template>

    <empty-state
      v-else
      :webp-image-path="require('~/assets/images/ui-states/pending-invites-136px.webp')"
      :png-image-path="require('~/assets/images/ui-states/pending-invites-136px.png')"
      :show-border="true"
      title="No pending invites"
      subtitle="Looks like all your invitations have been accepted. Go ahead and invite someone new!"
    />
    <portal to="modal">
      <z-confirm v-if="showCancelConfirm" @primaryAction="cancelInviteForMember" @onClose="close">
        <div class="mb-2 flex items-center text-base leading-relaxed text-vanilla-100">
          <z-icon icon="alert-circle" size="small" class="mr-2" />
          Do you want to cancel this invite?
        </div>
        <p class="text-sm leading-relaxed text-vanilla-400">
          The invitation link sent via email would become invalid.
          <b class="text-vanilla-100">This action cannot be reversed.</b>
        </p>
        <template #footer>
          <div class="mt-6 flex items-center justify-end space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close"
              >Cancel</z-button
            >
            <z-button
              button-type="danger"
              size="small"
              class="inline-flex items-center space-x-1.5"
              @click="cancelInviteForMember"
            >
              <z-icon
                v-if="inviteLoading"
                icon="spin-loader"
                class="animate-spin"
                color="ink-400"
              />
              <z-icon v-else icon="trash-2" color="ink-400" class="mb-0.5" />
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
} from '@deepsource/zeal'
import { TeamPerms } from '~/types/permTypes'
import { resolveNodes } from '~/utils/array'
import { TeamMemberInvitation } from '~/types/types'

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

  get teamInvites(): Array<TeamMemberInvitation> {
    return resolveNodes(this.team.invites)
  }

  get totalPages(): number {
    let pages = 0
    if (this.team.invites?.totalCount) {
      pages = Math.ceil(this.team.invites?.totalCount / this.limit) || 0
    }
    return pages
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
