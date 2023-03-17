<template>
  <div>
    <slot name="activator" :show-confirm="showConfirm">
      <z-button size="small" button-type="secondary" @click.stop.prevent="showConfirm">
        <span class="inline-flex items-center gap-x-2 text-xs text-cherry">
          <z-icon size="small" icon="user-x" color="current" />
          <span>Remove from group</span>
        </span>
      </z-button>
    </slot>
    <portal to="modal">
      <z-confirm
        v-if="showRemoveUserFromGroupConfirm"
        :title="`Are you sure you want to remove the user &quot;${
          orgUser.fullName || orgUser.email
        }&quot; from the group &quot;${group.name}&quot;?`"
        @onClose="showRemoveUserFromGroupConfirm = false"
      >
        <template #footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button
              button-type="ghost"
              :disabled="isRemovingUser"
              size="small"
              class="text-vanilla-100"
              @click="close"
            >
              Cancel
            </z-button>
            <z-button
              icon="trash-2"
              class="modal-primary-action"
              button-type="danger"
              size="small"
              label="Yes, remove this user"
              :is-loading="isRemovingUser"
              :disabled="isRemovingUser"
              loading-label="Removing user"
              @click="removeUser(group.id, orgUser.id, close)"
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
import { OrgUsersActions } from '~/store/control-panel/users'
import { EnterpriseGroup, EnterpriseUser } from '~/types/types'
import MutationFailedError from '~/utils/mutationFailedError'

const userManagementStore = namespace('control-panel/users')

@Component({
  components: { ZButton, ZConfirm, ZIcon },
  name: 'RemoveUserFromGroupButton'
})
export default class RemoveUserFromGroupButton extends Vue {
  @userManagementStore.Action(OrgUsersActions.REMOVE_USER_FROM_GROUP)
  removeUserFromGroup: (args: { groupId: string; userId: string }) => Promise<boolean>

  @Prop({ required: true })
  orgUser: EnterpriseUser

  @Prop({ required: true })
  group: EnterpriseGroup

  showRemoveUserFromGroupConfirm = false
  isRemovingUser = false

  showConfirm(): void {
    this.showRemoveUserFromGroupConfirm = true
  }

  async removeUser(groupId: string, userId: string, close: () => void): Promise<void> {
    this.isRemovingUser = true
    try {
      const response = await this.removeUserFromGroup({ groupId, userId })
      if (!response)
        throw new MutationFailedError('An error occured while removing user, please try again.')
      this.$toast.success('User removed from group succesfully.')
    } catch (e) {
      this.$toast.danger((e as Error).message)
    } finally {
      this.$emit('refetch')
      if (close) close()
      this.isRemovingUser = false
    }
  }
}
</script>
