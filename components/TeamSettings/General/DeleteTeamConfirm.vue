<template>
  <z-modal title="Delete team" @onClose="handleDialogClose">
    <div class="p-4 text-sm text-vanilla-300">
      <!-- Delete Step 1-->
      <div v-if="deleteStep === 0" class="space-y-3">
        <div>Are you sure you want to delete your team? Deleting your team would:</div>
        <div class="flex w-full items-start gap-2">
          <z-icon icon="alert-circle" color="cherry" size="x-small" class="mt-1 flex-shrink-0" />

          <div>
            Remove all data associated with
            <span class="rounded-sm bg-vanilla-100 bg-opacity-10 px-1 py-0.5 text-xs">{{
              teamName
            }}</span
            >. This includes all repositories and analyses runs in the past.
          </div>
        </div>
        <div class="flex w-full items-start gap-2">
          <z-icon icon="alert-circle" color="cherry" size="x-small" class="mt-1 flex-shrink-0" />

          <span>Remove all members of the team.</span>
        </div>
      </div>

      <!-- Delete Step 2-->
      <div v-else-if="deleteStep === 1" class="flex w-full flex-col gap-y-4">
        <div class="flex items-center gap-2 rounded-md bg-cherry bg-opacity-10 p-2 text-cherry-400">
          <z-icon icon="solid-alert-circle" color="cherry" />
          <span>This action is irreversible and cannot be undone.</span>
        </div>
        <label>
          <div class="mb-2">
            Please type
            <span class="rounded-sm bg-vanilla-100 bg-opacity-10 px-1 py-0.5 text-xs">{{
              teamName
            }}</span>
            to confirm deletion
          </div>
          <z-input
            v-model="typedTeamName"
            :placeholder="`Type ${teamName}`"
            :is-invalid="typedTeamName.length > 0 && typedTeamName !== teamName"
            :show-border="false"
            :class="{
              'border border-ink-200': !typedTeamName.length || typedTeamName === teamName
            }"
          />
        </label>
      </div>
    </div>
    <template #footer="{ close }">
      <div class="flex items-center justify-end gap-x-4 p-4 text-right text-vanilla-100">
        <z-button
          v-if="deleteStep === 0"
          button-type="danger"
          size="small"
          class="flex items-center"
          @click="deleteStep = 1"
        >
          <span>I understand, continue to delete</span>
          <z-icon icon="arrow-right" color="ink-400" size="small" />
        </z-button>

        <z-button
          v-else-if="deleteStep === 1"
          :is-loading="deletingTeam"
          :disabled="typedTeamName !== teamName || deletingTeam"
          icon="trash-2"
          button-type="danger"
          size="small"
          label="Delete team"
          loading-label="Deleting team"
          @click="$emit('delete-team', close)"
        />
      </div>
    </template>
  </z-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({})
export default class DeleteTeamConfirm extends Vue {
  @Prop({ required: true })
  teamName: string

  @Prop({ default: false })
  deletingTeam: boolean

  deleteStep = 0
  typedTeamName = ''

  /**
   * Handles the delete modal close event. Makes sure that the delete processes resets completely.
   *
   * @returns {void}
   */
  handleDialogClose(): void {
    this.deleteStep = 0
    this.$emit('close')
  }
}
</script>
