<template>
  <div>
    <div id="tabs" class="flex xl:col-span-2 pt-2.5 pb-0 border-b border-ink-200">
      <div class="flex self-end px-2 space-x-5 overflow-auto md:px-4 flex-nowrap">
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
    <div class="max-w-3xl p-4 space-y-8">
      <div class="space-y-4">
        <div v-if="pageHeading" class="flex justify-between">
          <h2 class="text-lg font-medium">{{ pageHeading }}</h2>
          <invite-members-modal @inviteSuccess="inviteSuccess" />
        </div>
        <nuxt-child></nuxt-child>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { ZButton, ZIcon, ZModal, ZTab } from '@deepsourcelabs/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import { InviteMembersModal } from '@/components/Members'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'
import TeamDetailMixin from '@/mixins/teamDetailMixin'

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
export default class Members extends mixins(TeamDetailMixin, OwnerBillingMixin) {
  showInviteModal = false

  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    const args = { login: owner, provider }

    await Promise.all([
      this.fetchInvitedMembers(),
      this.fetchSeatsInfo(args),
      this.fetchInviteUrl(args)
    ])
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

  /**
   * Handler method for the `inviteSuccess` event emitted
   * by `InviteMembersModal`
   *
   * @returns {Promise<void>}
   */
  async inviteSuccess(): Promise<void> {
    await this.fetchInvitedMembers()

    const { owner: login, provider } = this.$route.params
    const args = { login, provider, refetch: true }
    this.fetchSeatsInfo(args)
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
