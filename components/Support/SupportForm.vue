<template>
  <form @submit.prevent="submitForm">
    <div class="grid grid-cols-2 gap-x-4 gap-y-6">
      <support-form-label
        v-for="field in FORM_FIELDS"
        :id="`label-${field.inputBinds.name}`"
        :key="field.inputBinds.name"
        :display-name="field.displayName"
        :helper-text="field.helperText"
        :for="field.inputBinds.name"
        :class="field.classNames"
      >
        <component v-bind="field.inputBinds" :is="field.is" v-on="field.handlers" />
      </support-form-label>
    </div>
    <div class="space-y-2 text-xs leading-none" :class="{ 'mt-2': filesToUpload.length }">
      <div
        v-for="(uploadedFile, index) in filesToUpload"
        :key="index"
        class="flex items-center justify-between rounded-sm border border-slate-400 border-opacity-80 bg-ink-200 bg-opacity-40 px-4 py-2 text-vanilla-400"
      >
        <span>{{ uploadedFile.name }}</span>
        <button
          v-tooltip="'Remove file'"
          :disabled="isProcessingFiles || isSubmittingForm"
          type="button"
          class="cursor-pointer rounded-sm p-1 hover:bg-cherry-600 hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
          @click="removeFile(index)"
        >
          <z-icon icon="trash-2" color="cherry" size="x-small" />
        </button>
      </div>
    </div>
    <!-- Email validation -->
    <input
      id="multiEmailInput"
      ref="multiEmailInput"
      type="email"
      name="multiEmailInput"
      multiple
      class="hidden"
    />
    <div class="text-right">
      <z-button
        :disabled="isProcessingFiles || isSubmittingForm"
        :is-loading="isSubmittingForm"
        type="submit"
        icon="mail"
        loading-label="Sending request"
        label="Send request"
        size="small"
        class="mt-6"
      />
    </div>
  </form>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZInput, ZButton, ZIcon } from '@deepsource/zeal'

import SupportDescription from './SupportDescription.vue'
import { SupportValidationData } from '~/types/support'

@Component({
  name: 'SupportForm',
  components: { ZInput, ZButton, ZIcon, SupportDescription }
})
export default class SupportForm extends Vue {
  @Prop({ type: String, required: true })
  authorEmail: string

  @Prop({ type: Boolean, default: false })
  isSubmittingForm: boolean

  @Prop({ type: Array, default: () => [] })
  filesToUpload: File[]

  supportHTML = ''
  isProcessingFiles = false

  get FORM_FIELDS() {
    return [
      {
        displayName: 'From',
        helperText: 'Primary point of contact for this support request.',
        is: 'ZInput',
        inputBinds: {
          name: 'fromEmail',
          placeholder: '',
          readOnly: true,
          value: this.authorEmail
        },
        classNames: 'col-span-full md:col-span-1',
        handlers: false
      },
      {
        displayName: 'CC',
        helperText: 'Use commas to separate multiple email addresses.',
        is: 'ZInput',
        inputBinds: {
          name: 'ccEmails',
          placeholder: 'Enter email(s)'
        },
        classNames: 'col-span-full md:col-span-1',
        handlers: false
      },
      {
        displayName: 'Subject',
        helperText: '',
        is: 'ZInput',
        inputBinds: {
          name: 'subject',
          placeholder: ''
        },
        classNames: 'col-span-full',
        handlers: false
      },
      {
        displayName: 'Description',
        helperText: '',
        is: 'SupportDescription',
        inputBinds: {
          name: 'body',
          disabled: this.isSubmittingForm,
          isProcessingFiles: this.isProcessingFiles
        },
        classNames: 'col-span-full',
        handlers: {
          input: (newValue: string) => {
            this.supportHTML = newValue
          },
          'files-change': (newFiles: File[]) =>
            this.$emit('files-change', this.filesToUpload.concat(newFiles)),
          'update-files-processing': (newValue: boolean) => (this.isProcessingFiles = newValue)
        }
      }
    ]
  }

  get supportText(): string {
    //? This line is responsible for simply getting textual characters from the HTML string that the rich text editor component provides.
    //? Another way would be to use: new DOMParser().parseFromString(html,"text/html").documentElement.textContent
    //? But the memory overhead of using such task isn't worth it, since its just a minor validation
    //! Intentional ReDoS since better validation performed at backend
    return this.supportHTML.replace(/<[^>]+>/g, '') || ''
  }

  /**
   * Deletes a given file via its index from {@link filesToUpload}
   *
   * @param {number} fileIndex - Index of the file to delete
   * @returns {boolean}
   */
  removeFile(fileIndex: number): void {
    this.$emit(
      'files-change',
      this.filesToUpload.filter((_val, index) => fileIndex !== index)
    )
  }

  /**
   * Validates input data and shows errors as required.
   *
   * @param {SupportValidationData} validationData - Data to validate
   *
   * @returns {boolean} - Whether data is valid (true) or not (false).
   */
  validateInputs(valdiationData: SupportValidationData): boolean {
    if (!valdiationData.fromEmail) {
      this.$toast.danger('A primary email address is required.')
      return false
    }
    const multiEmailInput = this.$refs['multiEmailInput'] as HTMLInputElement
    multiEmailInput.value = valdiationData.fromEmail
    if (!multiEmailInput.checkValidity()) {
      this.$toast.danger('The primary email address is invalid.')
      multiEmailInput.value = ''
      return false
    }
    multiEmailInput.value = ''
    if (valdiationData.ccEmails) {
      multiEmailInput.value = valdiationData.ccEmails
      if (!multiEmailInput.checkValidity()) {
        this.$toast.danger('One or more email addresses added in CC are invalid.')
        multiEmailInput.value = ''
        return false
      }
      multiEmailInput.value = ''
    }
    if (!valdiationData.subject || valdiationData.subject.length < 5) {
      this.$toast.danger('Subject line should be 5 characters or more.')
      return false
    }
    if (valdiationData.subject.length > 250) {
      this.$toast.danger('Subject line should be 250 characters or less.')
      return false
    }
    if (!valdiationData.supportText.length || valdiationData.supportText.length < 20) {
      this.$toast.danger('Description should be 20 characters or more.')
      return false
    }
    return true
  }

  submitForm(e: Event) {
    const dataToValidate: Record<string, unknown> = {}
    const formData = new FormData(e.target as HTMLFormElement)
    const SKIPPED_INPUTS = ['multiEmailInput']

    formData.forEach((value, key) => {
      if (!SKIPPED_INPUTS.includes(key)) {
        dataToValidate[key] = value
      }
    })
    dataToValidate['supportText'] = this.supportText
    dataToValidate['supportHTML'] = this.supportHTML
    if (this.validateInputs(dataToValidate as SupportValidationData)) {
      this.$emit('submit', dataToValidate)
    }
  }
}
</script>
