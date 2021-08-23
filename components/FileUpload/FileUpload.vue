<template>
  <label
    class="flex items-center space-x-1 border border-ink-200 rounded-sm pr-1"
    :class="{
      'cursor-pointer': !disabled && !processing,
      'cursor-wait': processing,
      'cursor-not-allowed': disabled
    }"
  >
    <span class="sr-only">Add files</span>
    <input
      ref="fileUpload"
      id="file-upload"
      type="file"
      class="hidden"
      multiple
      :disabled="disabled"
      v-on="fileInputListeners"
    />
    <z-input
      v-model="uploadedFileNames"
      :read-only="true"
      :placeholder="uploadedFileNames || 'No files uploaded'"
      :show-border="false"
      type="text"
      aria-label="uploaded files"
      class="pointer-events-none -ml-4"
    />
    <z-button
      v-if="!uploadedFiles.length"
      icon="paperclip"
      size="small"
      button-type="secondary"
      :disabled="disabled"
      :is-loading="processing"
      loading-label="Processing"
      label="Add files"
      @keyup.prevent="
        if ($event.code === 'Space' || $event.code === 'Enter') $refs['fileUpload'].click()
      "
      @click="$refs['fileUpload'].click()"
    />
    <button
      v-else
      class="p-2 hover:bg-light-cherry hover:bg-opacity-20 rounded-sm disabled:opacity-50"
      :class="disabled || processing ? 'cursor-not-allowed' : 'cursor-pointer'"
      :disabled="disabled"
      v-tooltip="'Remove files'"
      @click="filesEmptied"
    >
      <z-icon icon="trash-2" color="cherry" size="small"></z-icon>
    </button>
  </label>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZInput } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon,
    ZButton,
    ZInput
  }
})
export default class FileUpload extends Vue {
  @Prop({ default: false })
  processing: boolean

  @Prop({ default: false })
  disabled: boolean

  private uploadedFiles = [] as File[]
  private prevFiles = [] as File[]

  get uploadedFileNames(): string {
    const nameExtractor = (acc: string, file: File): string => {
      return acc + file.name + ', '
    }
    return this.uploadedFiles.reduce(nameExtractor, '').slice(0, -2)
  }

  get fileInputListeners() {
    const thisRef = this
    return Object.assign({}, this.$listeners, {
      change: function (event: Event) {
        const fileList = (event.target as HTMLInputElement)?.files
        if (fileList) {
          thisRef.prevFiles = thisRef.uploadedFiles
          thisRef.uploadedFiles = Array.from(fileList)
        }
        thisRef.$emit('change', event)
      }
    })
  }

  emptyFiles(): void {
    this.prevFiles = this.uploadedFiles
    this.uploadedFiles = []
  }

  invalidateChanges(): void {
    this.uploadedFiles = this.prevFiles
    this.prevFiles = []
  }

  filesEmptied(): void {
    this.prevFiles = this.uploadedFiles
    this.uploadedFiles = []
    this.$emit('files-emptied')
  }
}
</script>