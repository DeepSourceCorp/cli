<template>
  <div>
    <z-rich-text
      :disabled="disabled"
      :max-length="1024"
      aria-labelled-by="label-description"
      placeholder="Describe the issue you’re facing, along with any relevant information. Please be as detailed and specific as possible."
      class="bg-ink-400"
      @input="(...emits) => $emit('input', ...emits)"
      @invalid="(...emits) => $emit('invalid', ...emits)"
    >
      <template #left-toolbar>
        <z-file-input
          ref="fileUploader"
          :disabled="isProcessingFiles || disabled"
          label="Add files"
          multiple
          accept="video/mp4,video/quicktime,image/jpeg,image/png,text/plain,text/csv,application/rtf,text/rtf"
          @change="prepareFiles"
          @files-emptied="$emit('files-change', [])"
        >
          <template #activator="{ open }">
            <z-button
              v-tooltip="'Attach files'"
              :disabled="isProcessingFiles || disabled"
              :is-loading="isProcessingFiles"
              icon="paperclip"
              size="x-small"
              button-type="ghost"
              icon-color="vanilla-400"
              type="button"
              class="ml-1 opacity-60 hover:text-vanilla-100 hover:opacity-100"
              :class="isProcessingFiles || disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
              @click="open"
            />
          </template>
        </z-file-input>
      </template>
    </z-rich-text>
    <div class="mt-2 text-xs leading-8 text-vanilla-400">
      You can attach images, videos, and text files up to 10MB in size.
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZRichText, ZFileInput, ZButton } from '@deepsource/zeal'

import { validateFileNames, validateFileSize } from '~/utils/files'

@Component({ name: 'SupportDescription', components: { ZRichText, ZFileInput, ZButton } })
export default class SupportDescription extends Vue {
  @Prop({ type: Boolean, default: false })
  disabled: boolean

  @Prop({ type: Boolean, default: false })
  isProcessingFiles: boolean

  /**
   * Validates and emits new files on `change` event of file input.
   *
   * @param {Event} event - Change event of a file
   * @param {HTMLInputElement} target
   * @returns {void}
   */
  prepareFiles({ target }: { target: HTMLInputElement }): void {
    if (target.files) {
      this.$emit('update-files-processing', true)
      const arrayOfFiles = Array.from(target.files)
      try {
        if (
          !validateFileSize(
            arrayOfFiles,
            10_485_760 //? 10,485,760 = 10MB
          )
        ) {
          this.$toast.danger('Total size of attachments should be less than 10 MB.')
          return
        }

        if (!validateFileNames(arrayOfFiles)) {
          this.$toast.danger(
            'File names must be 256 characters or less and cannot contain special characters.'
          )
          return
        }
        this.$emit('files-change', arrayOfFiles)
      } catch (err) {
        this.$toast.danger('An error occurred while processing files.')
      } finally {
        this.$emit('update-files-processing', false)
      }
    }
  }
}
</script>

<style lang="postcss">
.z-rich-text .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  @apply pointer-events-none float-left h-0 text-slate;
}
</style>
