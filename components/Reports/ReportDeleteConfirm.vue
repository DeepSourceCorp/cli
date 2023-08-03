<template>
  <z-confirm
    subtitle="Once deleted, you won't be able to restore this report"
    @onClose="$emit('close-confirm')"
  >
    <div class="mb-2 text-base font-medium leading-relaxed text-vanilla-100">
      Are you sure you want to delete this report?
    </div>
    <div class="text-sm leading-relaxed text-vanilla-400">
      You are deleting
      <span class="font-medium text-vanilla-100">{{ reportLabel }}</span
      >. Once deleted, you won’t be able to restore the report.
    </div>
    <template #footer="{ close }">
      <div class="mt-6 flex items-center justify-end gap-x-2 text-right text-vanilla-100">
        <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
          Cancel
        </z-button>
        <z-button
          icon="trash-2"
          class="modal-primary-action"
          button-type="danger"
          size="small"
          :disabled="isLoading"
          :is-loading="isLoading"
          @click="$emit('delete-report', close)"
        >
          Yes, delete this report
        </z-button>
      </div>
    </template>
  </z-confirm>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

/**
 * Confirm report delete modal
 */
@Component({})
export default class ReportDeleteConfirm extends Vue {
  @Prop({ required: true })
  reportLabel: boolean

  @Prop({ default: false })
  isLoading: boolean
}
</script>
