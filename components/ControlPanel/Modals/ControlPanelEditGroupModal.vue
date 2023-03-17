<template>
  <div>
    <slot name="activator" :show-modal="showModal">
      <z-button
        icon="edit-2"
        label="Edit"
        size="small"
        button-type="secondary"
        @click="showModal"
      />
    </slot>
    <portal to="modal">
      <z-modal
        v-if="showEditGroupModal"
        title="Edit group"
        primary-action-label="Confirm"
        primary-action-icon="check-circle"
        width="narrow"
        class="shadow-double-dark"
        @onClose="showEditGroupModal = false"
      >
        <div class="p-4 text-sm text-vanilla-400 min-h-20">
          <label>
            <div class="text-xs mb-1.5">Group name<span class="text-cherry">*</span></div>
            <z-input v-model="groupName" placeholder="Group name..." size="small" class="w-full" />
          </label>
        </div>
        <template #footer="{ close }">
          <div class="p-4 space-x-4 text-right text-vanilla-100 border-slate-400">
            <z-button
              v-if="editingGroup"
              disabled
              button-type="primary"
              size="small"
              class="flex items-center"
            >
              <z-icon icon="spin-loader" color="ink" class="mr-2 animate-spin" />
              Updating group
            </z-button>
            <z-button
              v-else
              icon="check-circle"
              button-type="primary"
              size="small"
              :disabled="!groupName.length"
              class="modal-primary-action"
              @click="editGroup(close)"
              >Confirm</z-button
            >
          </div>
        </template>
      </z-modal>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace, Prop, Watch } from 'nuxt-property-decorator'
import { ZButton, ZModal, ZIcon, ZInput } from '@deepsource/zeal'
import { OrgGroupsActions } from '~/store/control-panel/groups'
import { EnterpriseGroup } from '~/types/types'

const groupManagementStore = namespace('control-panel/groups')

@Component({
  components: { ZButton, ZModal, ZIcon, ZInput },
  name: 'ControlPanelEditGroupModal'
})
export default class ControlPanelEditGroupModal extends Vue {
  @groupManagementStore.Action(OrgGroupsActions.UPDATE_GROUP)
  updateOrgGroup: (args: { groupId: string; groupName: string }) => Promise<boolean>

  @Prop({ required: true })
  group: EnterpriseGroup

  editingGroup = false
  showEditGroupModal = false
  groupName = ''

  showModal(): void {
    this.showEditGroupModal = true
  }

  async editGroup(close: () => void): Promise<void> {
    this.editingGroup = true
    const response = await this.updateOrgGroup({
      groupId: this.group.id,
      groupName: this.groupName
    })
    if (response) {
      this.$emit('refetch')
      this.$toast.success('Group created successfully.')
      if (close) close()
    } else {
      this.$toast.danger('An error occured while deleting group, please try again.')
    }
    this.editingGroup = false
  }

  @Watch('group.name', { immediate: true })
  updateGroupName(newGroupName: string): void {
    this.groupName = newGroupName
  }
}
</script>
