<template>
  <div v-if="!isLoading && groupInvites.length" class="flex justify-center items-center p-4 pb-6">
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
                <copy-button :value="inviteLink" :disabled="!inviteLink" class="w-36" />
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
          class="mt-4 w-36"
        />
      </div>
    </div>
  </div>
  <div v-else-if="isLoading" class="flex flex-col justify-center items-center p-4 pb-6 gap-y-4">
    <div class="h-24 w-24 rounded-full bg-ink-300 animate-pulse"></div>
    <div class="h-11 w-full max-w-lg bg-ink-300 animate-pulse mt-2"></div>
    <div class="h-13 w-full max-w-lg bg-ink-300 animate-pulse"></div>
    <div class="h-13 w-full max-w-lg bg-ink-300 animate-pulse"></div>
    <div class="h-10 w-36 bg-ink-300 animate-pulse"></div>
  </div>
  <div v-else class="p-4">
    <lazy-empty-state
      title="No groups found"
      :show-border="true"
      class="h-control-panel flex flex-col justify-center"
    >
      <template slot="action">
        <div class="flex justify-around">
          <nuxt-link-button to="/control-panel/user-management/groups" class="space-x-1.5">
            <z-icon icon="plus" size="small" color="current" />
            <span>Create a group</span>
          </nuxt-link-button>
        </div>
      </template>
    </lazy-empty-state>
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace, Prop } from 'nuxt-property-decorator'
import { ZInput, ZButton, ZIcon, ZSelect, ZOption } from '@deepsource/zeal'

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
  resettingLink = false
  isLoading = true

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
    this.isLoading = false
  }

  triggerChange(value: string): void {
    this.inviteLink =
      this.groupInvites.find((groupInvite: EnterpriseGroup) => groupInvite.id === value)
        ?.invitationUrl || ''
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
