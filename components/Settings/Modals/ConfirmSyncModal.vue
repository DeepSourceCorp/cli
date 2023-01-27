<template>
  <z-modal title="Confirm and Sync" @onClose="$emit('close-sync-modal')">
    <div class="px-4 pt-5">
      <div class="mb-6">
        <p class="text-sm leading-6 mb-2.5 text-vanilla-300">
          This operation will sync your team's access control settings from
          {{ providerName }}. This has the following side-effects:
        </p>
        <ul class="space-y-6 text-sm text-vanilla-300">
          <li class="space-y-2.5">
            <div class="flex items-baseline gap-x-1.5">
              <z-icon icon="arrow-right" size="x-small" class="flex-shrink-0" />
              <span>
                Role of some members in your team on DeepSource will get updated as configured on
                {{ providerName }}. This may result in your team's occupied seat count being
                affected.
              </span>
            </div>
            <z-alert v-if="teamMemberRoleUpdatedCount" type="info" class="mx-4">
              {{ shortenLargeNumber(teamMemberRoleUpdatedCount) }}
              {{ teamMemberRoleUpdatedCount === 1 ? `user's role was` : `users' roles were` }}
              updated in your team.
            </z-alert>
          </li>
          <li class="space-y-2.5">
            <div class="flex items-baseline gap-x-1.5">
              <z-icon icon="arrow-right" size="x-small" class="flex-shrink-0" />
              <span>
                Collaborators will be added or updated on each repository as configured on
                {{ providerName }}.
              </span>
            </div>
            <z-alert v-if="repoCollaboratorUpdatedCount" type="info" class="mx-4">
              {{ shortenLargeNumber(repoCollaboratorUpdatedCount) }}
              {{
                repoCollaboratorUpdatedCount === 1
                  ? `user's permission was`
                  : `users' permissions were`
              }}
              updated across your team's repositories.
            </z-alert>
          </li>
        </ul>
      </div>

      <z-checkbox
        v-model="overrideChanges"
        label="Override changes made on DeepSource"
        size="small"
        class="cursor-pointer text-vanilla-400 border-ink-200 pt-3 border-t"
      />
    </div>

    <template #footer="{ close }">
      <div class="p-4 flex justify-end gap-x-2.5">
        <z-button
          label="Cancel"
          button-type="ghost"
          color="vanilla-100"
          size="small"
          class="bg-ink-200 opacity-80 hover:opacity-100"
          @click="close"
        />

        <z-button
          label="Sync access settings"
          icon="check"
          button-type="primary"
          size="small"
          class="modal-primary-action"
          @click="emitSyncAccessSettings(close)"
        />
      </div>
    </template>
  </z-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZModal, ZIcon, ZButton, ZCheckbox, ZAlert } from '@deepsource/zeal'

import { shortenLargeNumber } from '~/utils/string'

// Modal to confirm manual syncing
@Component({
  components: {
    ZModal,
    ZIcon,
    ZButton,
    ZCheckbox,
    ZAlert
  },
  methods: {
    shortenLargeNumber
  }
})
export default class ConfirmSyncModal extends Vue {
  @Prop({ required: true })
  providerName: string

  @Prop()
  teamMemberRoleUpdatedCount: number

  @Prop()
  repoCollaboratorUpdatedCount: number

  overrideChanges = true

  /**
   * Function to close the confirm sync modal
   *
   * @callback Callback
   * @returns {void}
   */

  /**
   * Method to emit `sync-access-settings` event
   *
   * @param {Callback} close - Callback method to close the modal
   * @returns {void}
   */
  emitSyncAccessSettings(close: () => void): void {
    this.$emit('sync-access-settings', this.overrideChanges)
    close()
  }
}
</script>
