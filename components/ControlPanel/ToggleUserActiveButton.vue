<template>
  <div>
    <slot name="activator" :show-confirm="showConfirm">
      <span
        v-tooltip="
          orgUser.isSuperuser
            ? `Superusers can\'t be ${orgUser.isActive ? 'deactivated' : 'activated'}`
            : null
        "
      >
        <z-button
          size="small"
          button-type="secondary"
          :icon="orgUser.isActive ? 'slash' : 'disc'"
          :label="`Mark as ${orgUser.isActive ? 'Inactive' : 'Active'}`"
          :disabled="orgUser.isSuperuser"
          @click.stop.prevent="showConfirm"
        />
      </span>
    </slot>
    <portal to="modal">
      <z-confirm
        v-if="showToggleUserActiveButton"
        :title="`Are you sure you want to ${
          orgUser.isActive ? 'deactivate' : 'activate'
        } the user &quot;${orgUser.fullName || orgUser.email}&quot;?`"
        @onClose="showToggleUserActiveButton = false"
      >
        <template #footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button
              button-type="ghost"
              :disabled="isTogglingUser"
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
              :label="`Yes, ${orgUser.isActive ? 'deactivate' : 'activate'} this user`"
              :is-loading="isTogglingUser"
              :disabled="isTogglingUser"
              :loading-label="`${orgUser.isActive ? 'deactivating' : 'activating'} user`"
              @click="toggleUser(orgUser.id, !orgUser.isActive, close)"
            />
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, namespace } from 'nuxt-property-decorator'
import { ZButton, ZConfirm } from '@deepsource/zeal'
import { OrgUsersActions } from '~/store/control-panel/users'
import MutationFailedError from '~/utils/mutationFailedError'
import { EnterpriseUser } from '~/types/types'

const userManagementStore = namespace('control-panel/users')

@Component({ components: { ZButton, ZConfirm }, name: 'ToggleUserActiveButton' })
export default class ToggleUserActiveButton extends Vue {
  @userManagementStore.Action(OrgUsersActions.TOGGLE_USER_ACTIVE)
  toggleUserActive: (args: { userId: string; isActive: boolean }) => Promise<boolean>

  @Prop({ required: true })
  orgUser: EnterpriseUser

  showToggleUserActiveButton = false
  isTogglingUser = false

  showConfirm(): void {
    this.showToggleUserActiveButton = true
  }

  async toggleUser(userId: string, isActive: boolean, close: () => void): Promise<void> {
    this.isTogglingUser = true
    try {
      const response = await this.toggleUserActive({ userId, isActive })
      if (!response) {
        throw new MutationFailedError(
          `An error occured while ${
            isActive ? 'activating' : 'deactivating'
          } user, please try again.`
        )
      }
      this.$toast.success(`User ${isActive ? 'activated' : 'deactivated'} succesfully.`)
    } catch (e) {
      this.$toast.danger((e as Error).message)
    } finally {
      this.$emit('refetch')
      if (close) close()
      this.isTogglingUser = false
    }
  }
}
</script>
