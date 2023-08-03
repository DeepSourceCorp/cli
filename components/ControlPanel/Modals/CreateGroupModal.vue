<template>
  <div>
    <slot name="activator" :show-modal="showModal">
      <z-button
        icon="plus"
        label="Create new group"
        size="small"
        class="hidden md:inline-flex"
        @click="showModal"
      />
      <z-button icon="plus" size="small" class="inline-flex md:hidden" @click="showModal" />
    </slot>
    <portal to="modal">
      <z-modal
        v-if="showCreateGroupModal"
        close-after-primary-action
        title="Create a group"
        primary-action-label="Create group"
        width="narrow"
        primary-action-icon="plus"
        class="shadow-double-dark"
        @onClose="showCreateGroupModal = false"
      >
        <div class="min-h-20 p-4 text-sm text-vanilla-400">
          <label>
            <div class="mb-1.5 text-xs">Group name<span class="text-cherry">*</span></div>
            <z-input v-model="newGroupName" placeholder="" size="small" class="w-full" />
          </label>
        </div>
        <template #footer="{ close }">
          <div class="space-x-4 border-slate-400 p-4 text-right text-vanilla-100">
            <z-button
              v-if="creatingGroup"
              class="flex items-center"
              button-type="primary"
              size="small"
              :disabled="true"
            >
              <z-icon icon="spin-loader" color="ink" class="mr-2 animate-spin" />
              Creating group
            </z-button>
            <z-button
              v-else
              icon="plus"
              class="modal-primary-action"
              button-type="primary"
              size="small"
              :disabled="!newGroupName.length"
              @click="createGroup(close)"
              >Create group</z-button
            >
          </div>
        </template>
      </z-modal>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { OrgGroupsActions } from '~/store/control-panel/groups'

const groupManagementStore = namespace('control-panel/groups')

@Component({
  name: 'ControlPanelEditGroupModal'
})
export default class ControlPanelEditGroupModal extends Vue {
  @groupManagementStore.Action(OrgGroupsActions.CREATE_GROUP)
  createOrgGroup: (args: { groupName: string }) => Promise<boolean>

  creatingGroup = false
  showCreateGroupModal = false
  newGroupName = ''

  showModal(): void {
    this.showCreateGroupModal = true
  }

  async createGroup(close: () => void): Promise<void> {
    this.creatingGroup = true
    const response = await this.createOrgGroup({ groupName: this.newGroupName })
    if (response) {
      this.newGroupName = ''
      this.$emit('refetch')
      this.$toast.success('Group created successfully.')
      if (close) close()
    } else {
      this.$toast.danger('An error occured while deleting group, please try again.')
    }
    this.creatingGroup = false
  }
}
</script>
