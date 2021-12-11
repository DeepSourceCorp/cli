<template>
  <div>
    <slot name="activator" :showConfirm="showConfirm">
      <z-button size="small" button-type="secondary" @click.stop.prevent="showConfirm">
        <span class="inline-flex items-center gap-x-2 text-xs text-cherry">
          <z-icon size="small" icon="user-x" color="currentColor" />
          <span>Remove user</span>
        </span>
      </z-button>
    </slot>
    <portal to="modal">
      <z-confirm
        v-if="showDeleteUserConfirm"
        :title="`Are you sure you want to delete the user &quot;${
          orgUser.fullName || orgUser.email
        }&quot;?`"
        subtitle="Once deleted, you won't be able to restore the user's data."
        @onClose="showDeleteUserConfirm = false"
      >
        <template v-slot:footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button
              button-type="ghost"
              :disabled="isDeletingUser"
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
              label="Yes, delete this user"
              :is-loading="isDeletingUser"
              :disabled="isDeletingUser"
              loading-label="Deleteing user"
              @click="deleteUser(orgUser.id, close)"
            />
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace, Prop } from 'nuxt-property-decorator'
import { ZButton, ZConfirm, ZIcon } from '@deepsourcelabs/zeal'
import { OrgUsersActions } from '~/store/control-panel/users'
import { EnterpriseUser } from '~/types/types'
import MutationFailedError from '~/utils/mutationFailedError'

const userManagementStore = namespace('control-panel/users')

@Component({
  components: { ZButton, ZConfirm, ZIcon },
  name: 'DeleteUserButton'
})
export default class DeleteUserButton extends Vue {
  @userManagementStore.Action(OrgUsersActions.DELETE_USER)
  deleteUserFromOrg: (args: { userId: string }) => Promise<boolean>

  @Prop({ required: true })
  orgUser: EnterpriseUser

  showDeleteUserConfirm = false
  isDeletingUser = false

  showConfirm(): void {
    this.showDeleteUserConfirm = true
  }

  async deleteUser(userId: string, close?: () => void) {
    this.isDeletingUser = true
    try {
      const response = await this.deleteUserFromOrg({ userId })
      if (!response) {
        throw new MutationFailedError('An error occured while deleting user, please try again.')
      }
      this.$toast.success('User deleted succesfully.')
      if (close) close()
      this.$router.push('/control-panel/user-management')
    } catch (e) {
      this.$toast.danger((e as Error).message)
      this.$emit('refetch')
      if (close) close()
    } finally {
      this.isDeletingUser = false
    }
  }
}
</script>
