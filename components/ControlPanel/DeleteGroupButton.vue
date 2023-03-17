<template>
  <div>
    <slot name="activator" :show-confirm="showConfirm">
      <z-button size="small" button-type="secondary" @click.stop.prevent="showConfirm">
        <span class="inline-flex items-center gap-x-2 text-xs text-cherry">
          <z-icon size="small" icon="trash-2" color="current" />
          <span>Delete group</span>
        </span>
      </z-button>
    </slot>
    <portal to="modal">
      <z-confirm
        v-if="showDeleteGroupConfirm"
        :title="`Are you sure you want to delete the group &quot;${group.name}&quot;?`"
        @onClose="showDeleteGroupConfirm = false"
      >
        <template #footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button
              button-type="ghost"
              :disabled="isDeletingGroup"
              size="small"
              label="Cancel"
              class="text-vanilla-100"
              @click="close"
            />
            <z-button
              icon="trash-2"
              class="modal-primary-action"
              button-type="danger"
              label="Yes, delete this group"
              :is-loading="isDeletingGroup"
              :disabled="isDeletingGroup"
              loading-label="Deleteing group"
              size="small"
              @click="deleteGroup(group.id, close)"
            />
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace, Prop } from 'nuxt-property-decorator'
import { ZButton, ZConfirm, ZIcon } from '@deepsource/zeal'
import { EnterpriseGroup } from '~/types/types'
import { OrgGroupsActions } from '~/store/control-panel/groups'
import MutationFailedError from '~/utils/mutationFailedError'

const groupManagementStore = namespace('control-panel/groups')

@Component({
  components: { ZButton, ZConfirm, ZIcon },
  name: 'DeleteGroupButton'
})
export default class DeleteGroupButton extends Vue {
  @groupManagementStore.Action(OrgGroupsActions.DELETE_GROUP)
  deleteOrgGroup: (args: { groupId: string }) => Promise<boolean>

  @Prop({ required: true })
  group: EnterpriseGroup

  @Prop({ default: false })
  emitRefetch: boolean

  showDeleteGroupConfirm = false
  isDeletingGroup = false

  showConfirm(): void {
    this.showDeleteGroupConfirm = true
  }

  async deleteGroup(groupId: string, close: () => void) {
    this.isDeletingGroup = true
    try {
      const response = await this.deleteOrgGroup({ groupId })
      if (!response) {
        throw new MutationFailedError('An error occured while deleting group, please try again.')
      }
      this.$toast.success('Group deleted succesfully.')
      if (close) close()
      if (this.emitRefetch) this.$emit('refetch')
      else this.$router.push('/control-panel/user-management/groups')
    } catch (e) {
      this.$toast.danger((e as Error).message)
      this.$emit('refetch')
      if (close) close()
    } finally {
      this.isDeletingGroup = false
    }
  }
}
</script>
