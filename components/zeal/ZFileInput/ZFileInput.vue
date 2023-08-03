<template>
  <label
    :class="{
      'cursor-pointer': !disabled && !processing,
      'cursor-wait': processing,
      'cursor-not-allowed': disabled
    }"
  >
    <span class="sr-only">{{ label }}</span>
    <input
      id="file-upload"
      ref="fileUpload"
      v-bind="$attrs"
      type="file"
      class="hidden"
      :disabled="disabled || processing"
      v-on="fileInputListeners"
    />
    <slot
      name="activator"
      :open="openFilePicker"
      :empty="filesEmptied"
      :file-names="uploadedFileNames"
    >
      <div class="inline-flex items-center space-x-1 rounded-sm border border-ink-200 pr-1">
        <z-input
          v-model="uploadedFileNames"
          :read-only="true"
          :placeholder="uploadedFileNames || 'No files uploaded'"
          :show-border="false"
          type="text"
          aria-label="uploaded files"
          class="pointer-events-none"
        />
        <span class="flex w-28 flex-row-reverse">
          <z-button
            v-if="!uploadedFiles.length"
            icon="paperclip"
            size="small"
            button-type="secondary"
            :disabled="disabled || processing"
            :is-loading="processing"
            loading-label="Processing"
            label="Add files"
            type="button"
            @keyup.prevent="
              () => {
                if ($event.code === 'Space' || $event.code === 'Enter') openFilePicker()
              }
            "
            @click="openFilePicker"
          />
          <button
            v-else
            v-tooltip="'Remove files'"
            class="rounded-sm p-2 hover:bg-cherry-600 hover:bg-opacity-20 disabled:opacity-50"
            :class="disabled || processing ? 'cursor-not-allowed' : 'cursor-pointer'"
            :disabled="disabled"
            type="button"
            @click="filesEmptied"
          >
            <z-icon icon="trash-2" color="cherry" size="small" />
          </button>
        </span>
      </div>
    </slot>
  </label>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ZFileInput',
  inheritAttrs: false,
  props: {
    processing: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: 'Add file'
    }
  },
  data() {
    return {
      uploadedFiles: [] as File[],
      prevFiles: [] as File[]
    }
  },
  computed: {
    uploadedFileNames(): string {
      const nameExtractor = (acc: string, file: File): string => {
        return acc + file.name + ', '
      }
      return this.uploadedFiles.reduce(nameExtractor, '').slice(0, -2)
    },
    fileInputListeners(): Record<string, Function | Function[]> {
      return Object.assign({}, this.$listeners, {
        change: (event: Event) => {
          const fileList = (event.target as HTMLInputElement)?.files
          if (fileList) {
            this.prevFiles = this.uploadedFiles
            this.uploadedFiles = Array.from(fileList)
          }
          this.$emit('change', event)
        }
      })
    }
  },
  methods: {
    openFilePicker(): void {
      ;(this.$refs['fileUpload'] as HTMLInputElement).click()
    },
    emptyFiles(): void {
      this.prevFiles = this.uploadedFiles
      this.uploadedFiles = []
    },
    invalidateChanges(): void {
      this.uploadedFiles = this.prevFiles
      this.prevFiles = []
    },
    filesEmptied(): void {
      this.prevFiles = this.uploadedFiles
      this.uploadedFiles = []
      this.$emit('files-emptied')
    }
  }
})
</script>
