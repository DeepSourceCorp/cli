<template>
  <div>
    <slot name="trigger">
      <button
        :disabled="loading"
        class="flex h-8 w-24 items-center justify-center gap-x-2 rounded-3px border border-ink-50 bg-ink-200 px-2 text-xs text-vanilla-400 hover:bg-ink-100 hover:text-vanilla-100"
        :class="loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
        @click="loading ? false : $emit('primary')"
      >
        <z-icon
          :icon="loading ? 'spin-loader' : 'file-output'"
          color="current"
          :class="{ 'animate-spin': loading }"
        />
        <span>Export</span>
      </button>
    </slot>

    <portal to="modal">
      <z-modal v-if="showExportLogsSuccessModal" title="Export log" @onClose="$emit('close-modal')">
        <div class="flex flex-col items-center px-4 py-8">
          <img
            :src="require('~/assets/images/ui-states/owner/invite-success-136px.png')"
            class="mx-auto max-h-84"
          />

          <div class="space-y-1.5 text-center">
            <span class="text-center text-base font-medium text-vanilla-200"
              >Preparing your export...</span
            >

            <p class="max-w-sm text-center text-sm leading-6 text-vanilla-400">
              We are processing the export request for your logs from
              <span class="font-medium text-vanilla-100">{{ startDate }}</span> to
              <span class="font-medium text-vanilla-100">{{ endDate }}</span
              >. You will receive them as a CSV file at
              <span class="font-medium text-vanilla-100">{{ viewerEmail }}</span
              >.
            </p>
          </div>
        </div>

        <template #footer>
          <div class="space-x-4 border-t border-ink-200 p-4 text-right text-vanilla-100">
            <z-button color="ink-400" icon="check" size="small" @click="$emit('close-modal')">
              Done
            </z-button>
          </div>
        </template>
      </z-modal>
    </portal>
  </div>
</template>

<script lang="ts">
import { ZButton, ZIcon, ZModal } from '@deepsource/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({ name: 'ExportLogsSuccessModal', components: { ZButton, ZIcon, ZModal } })
export default class ExportLogsSuccessModal extends Vue {
  @Prop({ default: false, type: Boolean })
  loading: boolean

  @Prop({ required: true, type: Boolean })
  showExportLogsSuccessModal: boolean

  @Prop({ required: true, type: String })
  startDate: string

  @Prop({ required: true, type: String })
  endDate: string

  @Prop({ required: true, type: String })
  viewerEmail: string
}
</script>
