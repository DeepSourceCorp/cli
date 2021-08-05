<template>
  <div>
    <div id="tabs" class="flex xl:col-span-2 pt-2.5 pb-0 border-b border-ink-200">
      <div class="flex self-end px-2 md:px-4 space-x-5 overflow-auto flex-nowrap">
        <nuxt-link :to="getRoute('active')">
          <z-tab :isActive="$route.path === getRoute('active')" border-active-color="vanilla-400">
            My team
          </z-tab>
        </nuxt-link>
        <nuxt-link :to="getRoute('invited')">
          <z-tab :isActive="$route.path === getRoute('invited')" border-active-color="vanilla-400">
            <div v-if="pendingInvitesCount" class="flex items-center space-x-2">
              <span>Pending invites</span>
              <span
                class="bg-cherry w-auto px-1.5 h-4 flex items-center justify-center rounded-full text-vanilla-100 text-xs"
                >{{ pendingInvitesCount > 9 ? '9+' : pendingInvitesCount }}</span
              >
            </div>
            <template v-else>Pending invites</template>
          </z-tab>
        </nuxt-link>
      </div>
    </div>
    <div class="p-4 space-y-8 max-w-3xl">
      <div class="space-y-4">
        <div v-if="pageHeading" class="flex justify-between">
          <h2 class="text-lg">{{ pageHeading }}</h2>
          <z-button
            size="small"
            buttonType="primary"
            class="whitespace-nowrap"
            @click="toggleModal(true)"
          >
            <div class="flex items-center space-x-2">
              <z-icon icon="user-plus" size="small" color="ink-400"></z-icon>
              <span>Invite new member</span>
            </div>
          </z-button>
          <portal to="modal">
            <invite-members-modal
              :showModal="showInviteModal"
              @close="toggleModal(false)"
              @inviteSuccess="inviteSuccess"
            ></invite-members-modal>
            <z-modal
              v-if="showSuccessModal"
              @onClose="showSuccessModal = false"
              @primaryAction="showSuccessModal = false"
              title="Invitation Sent"
            >
              <div class="p-4 space-y-4 border-b border-ink-200">
                <div class="text-5xl text-center">📫</div>
                <p class="text-xs text-vanilla-400 max-w-sm mx-auto text-center">
                  We've sent an email to your team members, they can create an account using the URL
                  in that email and join your team
                </p>
              </div>
            </z-modal>
          </portal>
        </div>
        <nuxt-child></nuxt-child>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import TeamDetailMixin from '@/mixins/teamDetailMixin'
import { ZTab, ZButton, ZIcon, ZModal } from '@deepsourcelabs/zeal'
import { InviteMembersModal } from '@/components/Members'

@Component({
  components: {
    ZTab,
    ZButton,
    ZIcon,
    InviteMembersModal,
    ZModal
  },
  middleware: ['validateProvider'],
  layout: 'dashboard'
})
export default class Members extends mixins(TeamDetailMixin) {
  private showInviteModal = false
  private showSuccessModal = false

  async fetch(): Promise<void> {
    await this.fetchInvitedMembers()
  }

  async fetchInvitedMembers(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchInvitedUsers({
      login: owner,
      provider,
      currentPage: 1,
      limit: 10
    })
  }

  toggleModal(value: boolean): void {
    this.showInviteModal = value
  }

  inviteSuccess(): void {
    this.toggleModal(false)
    this.fetchInvitedMembers()
    this.showSuccessModal = true
  }

  get pendingInvitesCount(): number {
    return this.team.invites?.totalCount || 0
  }

  getRoute(candidate: string): string {
    return this.$generateRoute(['members', candidate])
  }

  get pageHeading(): string | false {
    if (this.$route.path == this.getRoute('active')) {
      return 'My team'
    }
    if (this.$route.path == this.getRoute('invited')) {
      return 'Pending invites'
    }
    return false
  }

  head(): Record<string, string> {
    const { owner } = this.$route.params
    return {
      title: `Members • ${owner}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
