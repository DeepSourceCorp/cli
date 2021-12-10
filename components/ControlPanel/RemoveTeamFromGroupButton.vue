<template>
  <div>
    <slot name="activator" :showConfirm="showConfirm">
      <z-button
        icon="trash-2"
        size="small"
        button-type="secondary"
        icon-color="cherry"
        color="cherry"
        label="Remove team"
        @click="showConfirm"
      />
    </slot>
    <portal to="modal">
      <z-confirm
        v-if="showRemoveTeamFromGroupConfirm"
        :title="`Are you sure you want to remove the team &quot;${
          team.name || team.login
        }&quot; from the group &quot;${group.name}&quot;?`"
        @onClose="showRemoveTeamFromGroupConfirm = false"
      >
        <template v-slot:footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button
              button-type="ghost"
              :disabled="isRemovingTeam"
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
              label="Yes, remove this team"
              :is-loading="isRemovingTeam"
              :disabled="isRemovingTeam"
              loading-label="Removing team"
              @click="removeTeam(group.id, team.id, close)"
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
import { EnterpriseGroup, Owner } from '~/types/types'
import { OrgGroupsActions } from '~/store/control-panel/groups'
import MutationFailedError from '~/utils/mutationFailedError'

const groupManagementStore = namespace('control-panel/groups')

@Component({
  components: { ZButton, ZConfirm, ZIcon },
  name: 'RemoveTeamFromGroupButton'
})
export default class RemoveTeamFromGroupButton extends Vue {
  @groupManagementStore.Action(OrgGroupsActions.REMOVE_TEAM_FROM_GROUP)
  removeTeamFromGroup: (args: { groupId: string; teamId: string }) => Promise<boolean>

  @Prop({ required: true })
  group: EnterpriseGroup

  @Prop({ required: true })
  team: Owner

  showRemoveTeamFromGroupConfirm = false
  isRemovingTeam = false

  showConfirm(): void {
    this.showRemoveTeamFromGroupConfirm = true
  }

  async removeTeam(groupId: string, teamId: string): Promise<void> {
    this.isRemovingTeam = true
    try {
      const response = await this.removeTeamFromGroup({
        groupId: groupId,
        teamId: teamId
      })
      if (!response) {
        throw new MutationFailedError('An error occured while removing team, please try again.')
      }
      this.$toast.success('Successfully removed team from group.')
    } catch (e) {
      this.$toast.danger((e as Error).message)
    } finally {
      this.$emit('refetch', { refetchAddTeams: true })
      this.isRemovingTeam = false
    }
  }
}
</script>
