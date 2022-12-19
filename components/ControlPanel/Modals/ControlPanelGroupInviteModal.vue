<template>
  <div>
    <slot name="activator" :showModal="showModal">
      <z-button
        icon="user-plus"
        label="Invite user"
        button-type="secondary"
        size="small"
        @click="showModal"
      />
    </slot>
    <portal to="modal">
      <z-modal
        v-if="showGroupInviteModal"
        title="Invite user"
        class="shadow-double-dark"
        @onClose="showGroupInviteModal = false"
      >
        <control-panel-invite :group-id="groupId" />
      </z-modal>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace, Prop } from 'nuxt-property-decorator'
import { ZButton, ZModal } from '@deepsource/zeal'
import { OrgGroupsActions } from '~/store/control-panel/groups'

const groupManagementStore = namespace('control-panel/groups')

@Component({
  components: { ZButton, ZModal },
  name: 'ControlPanelGroupInviteModal'
})
export default class ControlPanelGroupInviteModal extends Vue {
  @groupManagementStore.Action(OrgGroupsActions.UPDATE_GROUP)
  updateOrgGroup: (args: { groupId: string; groupName: string }) => Promise<boolean>

  @Prop({ required: true })
  groupId: string

  showGroupInviteModal = false

  showModal(): void {
    this.showGroupInviteModal = true
  }
}
</script>
