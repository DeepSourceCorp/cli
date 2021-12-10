<template>
  <div class="flex justify-center items-center p-4 pb-6">
    <div class="max-w-lg">
      <img src="~/assets/images/ui-states/control-panel/group-invite.svg" alt="" class="mx-auto" />
      <p class="mt-4 text-sm max-w-md mx-auto text-center">
        Share the invite link to onboard new users to your DeepSource Enterprise Installation.
      </p>
      <div class="space-y-4 mt-6">
        <div v-if="!groupId">
          <z-select
            v-model="selectedGroup"
            :selected="selectedGroup"
            :key="selectedGroup"
            text-size="text-base"
            placeholder=""
            @change="triggerChange"
          >
            <z-option v-for="opt in groupInvites" :key="opt.id" :label="opt.name" :value="opt.id" />
          </z-select>
        </div>
        <div>
          <z-input :value="inviteLink" size="large" read-only class="self-end pr-0.5">
            <template slot="right">
              <div class="pr-1">
                <z-button
                  button-type="secondary"
                  size="small"
                  spacing="px-2"
                  :disabled="!inviteLink.length"
                  class="flex items-center w-32 gap-x-2"
                  @click="copyInviteLink"
                >
                  <z-icon :icon="clipboardIcon" size="small" />
                  <span>{{ copyText }}</span>
                </z-button>
              </div>
            </template>
          </z-input>
        </div>
      </div>
      <div class="flex justify-center">
        <z-button
          button-type="secondary"
          icon="refresh-cw"
          label="Reset link"
          loading-label="Resetting link"
          :is-loading="resettingLink"
          :disabled="resettingLink"
          @click="resetLink"
          class="mt-4"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace, Prop } from 'nuxt-property-decorator'
import { ZInput, ZButton, ZIcon, ZSelect, ZOption } from '@deepsourcelabs/zeal'

import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import { OrgGroupsActions, OrgGroupsGetters } from '~/store/control-panel/groups'
import { EnterpriseGroup } from '~/types/types'

const groupManagementStore = namespace('control-panel/groups')

@Component({
  components: { ZInput, ZButton, ZIcon, ZSelect, ZOption },
  name: 'ControlPanelInvite'
})
export default class ControlPanelInvite extends mixins(ControlPanelBaseMixin) {
  @groupManagementStore.Getter(OrgGroupsGetters.ORG_GROUP_INVITES_DATA)
  groupInvites: EnterpriseGroup[]

  @groupManagementStore.Action(OrgGroupsActions.FETCH_GROUP_INVITES)
  fetchGroupInvites: (args?: { refetch?: boolean }) => Promise<void>

  @groupManagementStore.Action(OrgGroupsActions.RESET_GROUP_INVITE)
  resetGroupInvite: (args: { groupId: string }) => Promise<boolean>

  @Prop({ default: '' })
  groupId: string

  selectedGroup = ''
  inviteLink = ''
  clipboardIcon = 'clipboard'
  copyText = 'Copy'
  resettingLink = false

  async fetch(): Promise<void> {
    await this.fetchGroupInvites({ refetch: true })
    if (this.groupInvites.length) {
      if (this.groupId) {
        this.triggerChange(this.groupId)
      } else if (this.selectedGroup) {
        this.triggerChange(this.selectedGroup)
      } else if (this.$route.query['group']) {
        this.selectedGroup = this.$route.query['group'].toString()
      } else {
        this.selectedGroup = this.groupInvites[0].id
      }
    }
    this.resettingLink = false
  }

  async triggerChange(value: string): Promise<void> {
    this.inviteLink =
      this.groupInvites.find((groupInvite: EnterpriseGroup) => groupInvite.id === value)
        ?.invitationUrl || ''
  }

  async copyInviteLink(): Promise<void> {
    if (this.inviteLink) {
      this.$copyToClipboard(this.inviteLink)
      this.clipboardIcon = 'check'
      this.copyText = 'Copied'
      setTimeout(() => {
        this.clipboardIcon = 'clipboard'
        this.copyText = 'Copy'
      }, 1000)
    }
  }

  async resetLink(): Promise<void> {
    this.resettingLink = true
    const response = await this.resetGroupInvite({ groupId: this.groupId || this.selectedGroup })
    if (response) this.$toast.success('Invite link reset succesfully.')
    else this.$toast.danger('An error occured while resetting invite link, please try again.')
    this.$fetch()
  }
}
</script>
