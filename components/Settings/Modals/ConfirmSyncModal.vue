<template>
  <z-modal title="Confirm and sync access settings" @onClose="$emit('close-sync-modal')">
    <div class="px-4 pt-5">
      <div class="mb-6">
        <p class="mb-2.5 text-sm leading-6 text-vanilla-300">
          This operation will sync your team's access control settings and member permissions from
          {{ providerName }}. This has the following side-effects:
        </p>
        <ul class="space-y-6 text-sm text-vanilla-300">
          <li class="space-y-2.5">
            <div class="flex items-baseline gap-x-1.5">
              <z-icon icon="arrow-right" size="x-small" class="flex-shrink-0" />
              <span>
                Roles of some team members can get updated on DeepSource. This may affect the number
                of seats your team is occupying on DeepSource.
              </span>
            </div>
            <z-alert v-if="teamMemberRoleUpdatedCount" type="info" class="mx-4">
              {{ teamMemberRoleUpdatedCopyText }}
            </z-alert>
          </li>
          <li class="space-y-2.5">
            <div class="flex items-baseline gap-x-1.5">
              <z-icon icon="arrow-right" size="x-small" class="flex-shrink-0" />
              <span>
                Direct collaborators will be added or updated on each repository as configured on
                {{ providerName }}.
              </span>
            </div>
            <z-alert v-if="repoCollaboratorUpdatedCount" type="info" class="mx-4">
              {{ repoCollaboratorUpdatedCopyText }}
            </z-alert>
          </li>
        </ul>
      </div>

      <z-checkbox
        v-model="overrideChanges"
        label="Override manual changes to roles and permissions on DeepSource"
        size="small"
        class="cursor-pointer border-t border-ink-200 pt-3 text-vanilla-400"
      />
    </div>

    <template #footer="{ close }">
      <div class="flex justify-end gap-x-2.5 p-4">
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

import { shortenLargeNumber } from '~/utils/string'

// Modal to confirm manual syncing
@Component({
  methods: {
    shortenLargeNumber
  }
})
export default class ConfirmSyncModal extends Vue {
  @Prop({ required: true })
  providerName: string

  @Prop({ default: 0 })
  teamMemberRoleUpdatedCount: number

  @Prop({ default: 0 })
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

  get teamMemberRoleUpdatedCopyText(): string {
    if (this.teamMemberRoleUpdatedCount === 1) {
      return 'Role of 1 user has been manually updated on DeepSource. This will be affected by the sync.'
    }

    return `Roles of ${shortenLargeNumber(
      this.teamMemberRoleUpdatedCount
    )} users are manually updated on DeepSource. This will be affected by the sync.`
  }

  get repoCollaboratorUpdatedCopyText(): string {
    if (this.repoCollaboratorUpdatedCount === 1) {
      return 'Repository permissions for 1 user has been manually updated on DeepSource. This will be affected by the sync.'
    }

    return `Repository permissions for ${shortenLargeNumber(
      this.repoCollaboratorUpdatedCount
    )} users are manually updated on DeepSource. This will be affected by the sync.`
  }
}
</script>
