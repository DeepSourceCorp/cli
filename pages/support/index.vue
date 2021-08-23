<template>
  <div class="p-4">
    <h1 class="text-xl font-semibold">Get Help</h1>
    <form
      class="max-w-xl grid gap-y-4 mt-6"
      novalidate
      @submit.prevent="createSupportTicket"
      @reset.prevent="resetFormData"
    >
      <div
        v-if="!viewerContexts || !Object.keys(supportContext).length"
        class="h-11 w-64 animate-pulse bg-ink-300"
      ></div>
      <author-selector
        v-else-if="viewerContexts && viewerContexts.length > 1 && !isFormSubmitting"
        :selected-context="supportContext"
        :selection-contexts="viewerContexts"
        @change="selectAccount"
      />
      <div v-else-if="Object.keys(supportContext).length">
        <span
          class="
            inline-flex
            items-center
            space-x-1
            text-vanilla-200
            px-4
            py-2
            text-sm
            rounded-sm
            bg-ink-300
            transition-all
            duration-75
            h-11
          "
          :class="{ 'cursor-not-allowed': isFormSubmitting }"
        >
          <z-avatar
            type="span"
            size="sm"
            class="flex-shrink-0 mr-1"
            :image="supportContext.avatar_url"
            :user-name="supportContext.login"
          ></z-avatar>
          <span class="leading-none">
            {{ supportContext.team_name || supportContext.login }}
          </span>
        </span>
      </div>
      <label for="author-email" class="sr-only">Email</label>
      <z-input
        v-model="authorEmail"
        id="author-email"
        placeholder="Email"
        type="email"
        :validate-on-blur="false"
        :read-only="true"
        padding="px-4"
      />
      <label for="author-cc" class="sr-only">CC</label>
      <z-input
        v-model="authorCC"
        id="author-cc"
        placeholder="CC"
        type="email"
        :validate-on-blur="false"
        :disabled="isFormSubmitting"
        padding="px-4"
        multiple
      />
      <label for="support-subject" class="sr-only">Subject</label>
      <z-input
        v-model="supportSubject"
        id="support-subject"
        placeholder="Subject"
        type="text"
        :disabled="isFormSubmitting"
        max-length="250"
        padding="px-4"
      />
      <z-rich-text
        v-model="supportHTML"
        placeholder="Please be as descriptive as possible"
        :min-length="20"
        :max-length="1024"
        :disabled="isFormSubmitting"
        class="max-w-xl"
        :class="{ 'cursor-not-allowed': isFormSubmitting }"
        aria-label="Description"
      />
      <file-upload
        ref="fileUploader"
        :disabled="isFileProcessing || isFormSubmitting"
        :processing="isFileProcessing"
        @change="uploadFiles"
        @files-emptied="uploadedFiles = []"
      />
      <div class="justify-self-end flex items-center">
        <z-button
          type="reset"
          button-type="secondary"
          :disabled="isFileProcessing || isFormSubmitting"
          label="Clear form"
          class="mr-2"
        />
        <z-button
          type="submit"
          icon="mail"
          :disabled="isFileProcessing || isFormSubmitting"
          :is-loading="isFormSubmitting"
          loading-label="Sending your message"
          label="Submit ticket"
        />
      </div>
    </form>
    <input ref="multiEmailInput" type="email" class="hidden" multiple />
    <portal to="modal">
      <z-confirm
        v-if="showNotif"
        primaryActionLabel="Okay"
        title="We've received your request"
        subtitle="Someone from our support team will reach out to you via email shortly."
        :hide-secondary-button="true"
        @primaryAction="closeDialog"
      >
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'
import {
  ZInput,
  ZRichText,
  ZButton,
  ZSelect,
  ZOption,
  ZIcon,
  ZMenu,
  ZMenuItem,
  ZMenuSection,
  ZAvatar,
  ZConfirm
} from '@deepsourcelabs/zeal'
import { FileUpload, ZFileUploadInterface } from '@/components/FileUpload'
import { AuthorSelector } from '@/components/Support'
import SubmitSupportTicketMutation from '~/apollo/mutations/support/submitSupportTicket.gql'
import { AttachmentObj, getBase64Files } from '~/utils/files'

type SupportValidationData = {
  ticketAuthor: string
  authorEmail: string
  authorCC: string
  supportSubject: string
  supportText: string
}

@Component({
  components: {
    ZInput,
    ZRichText,
    ZSelect,
    ZButton,
    ZOption,
    ZIcon,
    ZMenu,
    ZMenuItem,
    ZMenuSection,
    ZAvatar,
    ZConfirm,
    FileUpload,
    AuthorSelector
  },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  layout: 'sidebar-only'
})
export default class Support extends mixins(ActiveUserMixin) {
  private supportHTML = ''
  private supportSubject = ''
  private supportContext = {} as DashboardContext | Record<string, string>
  private authorEmail = ''
  private authorCC = ''
  private viewerContexts = []
  private uploadedFiles = [] as AttachmentObj[]
  private isFileProcessing = false
  private isFormSubmitting = false
  private showNotif = false

  get ticketAuthor(): string {
    return this.supportContext.team_name || this.supportContext.login
  }

  get supportText(): string {
    //? This line is responsible for simply getting textual characters from the HTML string that the rich text editor component provides.
    //? Another way would be to use: new DOMParser().parseFromString(html,"text/html").documentElement.textContent
    //? But the memory overhead of using such task isn't worth it, since its just a minor validation
    //! Intentional ReDoS since better validation performed at backend
    return this.supportHTML.replace(/<[^>]+>/g, '') || ''
  }

  validateFileSize(arrayOfFiles: File[]): boolean {
    const sizeConcatenator = (accumulator: number, currentValue: File): number =>
      accumulator + currentValue.size
    //? 5242880 = 5MB
    const filesLt5mbCheck = (file: File) => file.size <= 5242880
    const areFilesValidSize = arrayOfFiles.every(filesLt5mbCheck)
    if (!areFilesValidSize) {
      this.$toast.danger('The attachment should not be larger than 5MB')
      this.isFileProcessing = false
      return false
    }
    const totalFileSize = arrayOfFiles.reduce(sizeConcatenator, 0)
    //? 7340032 = 7MB. Payload cap is 10MB. 7MB => ~9.33MB post base64 conversion
    //? ref: https://stackoverflow.com/questions/4715415/base64-what-is-the-worst-possible-increase-in-space-usage
    if (totalFileSize > 7340032) {
      this.$toast.danger('Total size of attachments should be less than 7MB')
      this.isFileProcessing = false
      return false
    }
    return true
  }

  closeDialog(): void {
    this.showNotif = false
  }

  selectAccount(selectedContext: DashboardContext) {
    this.supportContext = selectedContext
  }

  async fetch(): Promise<void> {
    await this.fetchActiveUser()
    this.authorEmail = this.viewer.email
    this.viewerContexts = this.viewer.dashboardContext
    this.supportContext = this.activeDashboardContext
  }

  async uploadFiles({ target }: { target: HTMLInputElement }): Promise<void> {
    if (target.files) {
      this.isFileProcessing = true
      const arrayOfFiles = Array.from(target.files)
      try {
        if (this.validateFileSize(arrayOfFiles))
          this.uploadedFiles = await getBase64Files(arrayOfFiles)
        else (this.$refs['fileUploader'] as ZFileUploadInterface).invalidateChanges()
      } catch (err) {
        this.$toast.danger('An error occured while processing files')
      } finally {
        this.isFileProcessing = false
      }
    }
  }

  validateInputs(valdiationData: SupportValidationData): boolean {
    if (!valdiationData.ticketAuthor) {
      throw new Error('A valid DeepSource account or organization needs to be selected.')
    }
    if (!valdiationData.authorEmail) {
      throw new Error('Primary email address is required.')
    }
    const multiEmailInput = this.$refs['multiEmailInput'] as HTMLInputElement
    multiEmailInput.value = valdiationData.authorEmail
    if (!multiEmailInput.checkValidity()) {
      throw new Error('Invalid primary email address given.')
    }
    multiEmailInput.value = ''
    if (valdiationData.authorCC) {
      multiEmailInput.value = valdiationData.authorCC
      if (!multiEmailInput.checkValidity()) {
        throw new Error('Invalid input present in CC emails. Please enter comma separated emails.')
      }
      multiEmailInput.value = ''
    }
    if (!valdiationData.supportSubject || valdiationData.supportSubject.length < 5) {
      throw new Error('A subject with at least 5 characters is required.')
    }
    if (valdiationData.supportSubject.length > 250) {
      throw new Error('Please keep the subject line shorter than 250 characters.')
    }
    if (!valdiationData.supportText.length || valdiationData.supportText.length < 20) {
      throw new Error('A description with at least 20 characters is required.')
    }
    return true
  }

  async createSupportTicket(): Promise<void> {
    this.isFormSubmitting = true
    try {
      const dataToValidate: SupportValidationData = {
        authorEmail: this.authorEmail,
        authorCC: this.authorCC,
        supportSubject: this.supportSubject,
        supportText: this.supportText,
        ticketAuthor: this.ticketAuthor
      }
      if (this.validateInputs(dataToValidate)) {
        const formData = {
          fromEmail: dataToValidate.authorEmail,
          ccEmails: dataToValidate.authorCC,
          subject: dataToValidate.supportSubject,
          body: `Account/Organization Name: ${dataToValidate.ticketAuthor} <br/> ${this.supportHTML}`,
          attachments: this.uploadedFiles
        }
        try {
          const response = await this.$applyGraphqlMutation(SubmitSupportTicketMutation, {
            input: formData
          })
          if (response.data.submitSupportTicket.ok) {
            this.showNotif = true
            this.resetFormData()
          } else {
            this.$toast.danger('An error occured while submitting your ticket.')
          }
        } catch (reqErr) {
          this.$toast.danger('An error occured while submitting your ticket.')
          formData.attachments = this.uploadedFiles.map(({ filename, base64Data }) => {
            return { filename, sizeInBytes: new Blob([base64Data]).size } as AttachmentObj
          })
          this.logSentryErrorForUser(reqErr, 'Support Page', formData)
        }
      }
    } catch (err) {
      this.$toast.danger(err.message)
    } finally {
      this.isFormSubmitting = false
    }
  }

  resetFormData(): void {
    this.authorCC = ''
    this.supportSubject = ''
    this.supportHTML = ''
    this.uploadedFiles = []
    ;(this.$refs['fileUploader'] as ZFileUploadInterface).emptyFiles()
  }
}
</script>

<style>
.z-rich-text .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  @apply h-0 pointer-events-none float-left text-slate;
}
</style>
