<template>
  <div>
    <slot name="activator" :showConfirm="showConfirm">
      <z-button size="small" button-type="secondary" @click.stop.prevent="showConfirm">
        <span class="inline-flex items-center gap-x-2 text-xs text-cherry">
          <z-icon size="small" icon="user-x" color="current" />
          <span>Remove from team</span>
        </span>
      </z-button>
    </slot>
    <portal to="modal">
      <z-confirm
        v-if="showRemoveUserFromTeamConfirm"
        :title="`Are you sure you want to remove the user &quot;${
          orgUser.fullName || orgUser.email
        }&quot; from the team &quot;${team.name || team.login}&quot;?`"
        @onClose="showRemoveUserFromTeamConfirm = false"
      >
        <template v-slot:footer="{ close }">
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
              @click="removeUser(team.id, orgUser.email, close)"
              >Yes, remove this user</z-button
            >
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace, Prop } from 'nuxt-property-decorator'
import { ZButton, ZConfirm, ZIcon } from '@deepsourcelabs/zeal'
import { EnterpriseUser, Owner } from '~/types/types'
import { TeamActions } from '~/store/team/detail'

const teamStore = namespace('team/detail')

@Component({
  components: { ZButton, ZConfirm, ZIcon },
  name: 'RemoveUserFromTeamButton'
})
export default class RemoveUserFromTeamButton extends Vue {
  @teamStore.Action(TeamActions.REMOVE_MEMBER)
  removeTeamMember: (args: { ownerId: string; email: string }) => Promise<void>

  @Prop({ required: true })
  orgUser: EnterpriseUser

  @Prop({ required: true })
  team: Owner

  showRemoveUserFromTeamConfirm = false
  isRemovingUser = false

  showConfirm(): void {
    this.showRemoveUserFromTeamConfirm = true
  }

  async removeUser(ownerId: string, email: string): Promise<void> {
    this.isRemovingUser = true
    await this.removeTeamMember({ ownerId, email })
    this.$emit('refetch')
    this.isRemovingUser = false
  }
}
</script>
