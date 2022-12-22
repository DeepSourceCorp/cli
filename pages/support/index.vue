<template>
  <div>
    <div class="sticky z-10 top-10 lg:top-0">
      <div class="flex items-center px-4 py-4 bg-ink-300">
        <!-- ! Need a custom icon to use -->
        <!-- <z-icon icon="support" size="medium" color="vanilla-100" class="mr-2" /> -->
        <h1 class="my-px text-xl font-semibold leading-none">Contact support</h1>
      </div>
      <hr class="border-slate-400" />
    </div>
    <div class="p-4 pt-0 max-w-7xl">
      <form
        novalidate
        class="grid mt-4 gap-y-5"
        @submit.prevent="createSupportTicket"
        @reset.prevent="resetFormData"
      >
        <div class="space-y-1.5 max-w-lg">
          <label for="author-account" class="text-xs">Account or team</label>
          <div>
            <div
              v-if="!ticketAuthorId"
              class="py-5 my-px rounded-sm bg-ink-300 animate-pulse"
            ></div>
            <z-select
              v-else
              id="author-account"
              v-model="ticketAuthorId"
              :selected="ticketAuthorId"
              spacing="px-4 py-2"
              text-size="text-sm"
            >
              <z-option
                v-for="context in viewerContexts"
                :key="context.team_name || context.login"
                :label="`${context.team_name || context.login} (${context.vcs_provider_display} ${
                  context.type === 'user' ? 'Account' : 'Organization'
                })`"
                :value="context.id.toString()"
                text-size="text-sm"
              >
                <div class="flex items-center space-x-2">
                  <z-avatar
                    :fallback-image="getDefaultAvatar(context.login, context.type === 'user')"
                    :image="context.avatar_url"
                    :user-name="context.login"
                    type="span"
                    size="sm"
                    class="flex-shrink-0"
                  />
                  <span>
                    {{ context.team_name || context.login }}
                    {{
                      `(${context.vcs_provider_display} ${
                        context.type === 'user' ? 'Account' : 'Organization'
                      })`
                    }}
                  </span>
                </div>
              </z-option>
            </z-select>
          </div>
          <p class="text-vanilla-400 text-xs">
            Select the workspace to which this support request is related.
          </p>
        </div>
        <div class="space-y-1.5 max-w-lg">
          <label for="author-email" class="text-xs">From</label>
          <div>
            <div v-if="!authorEmail" class="py-5 my-px rounded-sm bg-ink-300 animate-pulse"></div>
            <z-select
              v-else
              id="author-email"
              v-model="authorEmail"
              :selected="authorEmail"
              spacing="px-4 py-2"
              text-size="text-sm"
            >
              <z-option
                :label="`${viewer.fullName} <${authorEmail}>`"
                :value="authorEmail"
                text-size="text-sm"
              />
            </z-select>
          </div>
          <p class="text-vanilla-400 text-xs">
            We'll use this email as the primary point of contact for this support request.
          </p>
        </div>
        <div class="space-y-1.5 max-w-lg">
          <label for="author-cc" class="text-xs">CC</label>
          <z-input
            id="author-cc"
            v-model="authorCC"
            :disabled="isFormSubmitting"
            :validate-on-blur="false"
            type="email"
            padding="px-4"
            placeholder=""
            multiple
          />
          <p class="text-vanilla-400 text-xs">
            We'll keep these email addresses in CC when communicating to you about this ticket. Use
            a comma to separate multiple emails.
          </p>
        </div>
        <div class="space-y-1.5 max-w-lg">
          <label for="support-subject" class="text-xs">Subject</label>
          <z-input
            id="support-subject"
            v-model="supportSubject"
            :disabled="isFormSubmitting"
            type="text"
            max-length="250"
            placeholder=""
            padding="px-4"
          />
        </div>
        <div class="space-y-2 max-w-lg">
          <div class="space-y-1.5">
            <label id="support-description" class="text-xs">What is the issue?</label>

            <div class="min-w-0">
              <z-rich-text
                v-model="supportHTML"
                :disabled="isFormSubmitting"
                :min-length="20"
                :max-length="1024"
                aria-labelledby="support-description"
                min-length-err-msg="Please add at least 20 characters in the issue description."
                placeholder=""
                :class="{ 'cursor-not-allowed': isFormSubmitting }"
              >
                <template v-if="!$config.onPrem" #left-toolbar>
                  <z-file-input
                    :disabled="isFileProcessing || isFormSubmitting"
                    ref="fileUploader"
                    label="Add files"
                    multiple
                    accept="video/mp4,video/quicktime,image/jpeg,image/png,text/plain,text/csv,application/rtf,application/xml,text/rtf"
                    @change="prepareFiles"
                    @files-emptied="filesToUpload = []"
                  >
                    <template v-slot:activator="{ open }">
                      <z-button
                        v-tooltip="'Attach files'"
                        :disabled="isFileProcessing || isFormSubmitting"
                        :is-loading="isFileProcessing"
                        icon="paperclip"
                        size="x-small"
                        button-type="ghost"
                        icon-color="vanilla-400"
                        type="button"
                        :class="
                          isFileProcessing || isFormSubmitting
                            ? 'cursor-not-allowed'
                            : 'cursor-pointer'
                        "
                        class="ml-1 opacity-60 hover:opacity-100 hover:text-vanilla-100"
                        @click="open"
                      />
                    </template>
                  </z-file-input>
                </template>
              </z-rich-text>
            </div>
            <p class="text-vanilla-400 text-xs">
              Please be as descriptive as possible. If you're reporting a bug, please list down the
              steps you took. This will help us reproduce the behavior. You can attach images,
              videos or text files up to 10 MB in size.
            </p>
          </div>
          <div class="space-y-2 max-w-lg text-xs leading-none">
            <div
              v-for="(uploadedFile, index) in filesToUpload"
              :key="index"
              class="flex items-center justify-between px-4 py-2 rounded-sm bg-ink-300 text-vanilla-400"
            >
              <span>{{ uploadedFile.name }}</span>
              <button
                v-tooltip="'Remove file'"
                :disabled="isFileProcessing || isFormSubmitting"
                type="button"
                :class="
                  isFileProcessing || isFormSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'
                "
                class="p-1 rounded-sm hover:bg-cherry-600 hover:bg-opacity-20 disabled:opacity-50"
                @click="removeFile(index)"
              >
                <z-icon icon="trash-2" color="cherry" size="x-small"></z-icon>
              </button>
            </div>
          </div>
        </div>
        <div class="space-y-1.5 max-w-lg flex justify-end">
          <z-button
            :disabled="isFileProcessing || isFormSubmitting"
            :is-loading="isFormSubmitting"
            type="submit"
            icon="mail"
            loading-label="Sending request"
            label="Send request"
            size="small"
          />
        </div>
      </form>
      <input ref="multiEmailInput" type="email" class="hidden" multiple />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'
import {
  ZInput,
  ZRichText,
  ZButton,
  ZSelect,
  ZOption,
  ZIcon,
  ZAvatar,
  ZConfirm,
  ZFileInput
} from '@deepsource/zeal'
import { InfoBanner } from '@/components/Settings/index'
import SubmitSupportTicketMutation from '~/apollo/mutations/support/submitSupportTicket.gql'
import { FileUploadContexts, uploadFiles, FileUploadTokenT, FileUploadError } from '~/utils/files'
import { getDefaultAvatar } from '~/utils/ui'
import { AuthActionTypes, AuthGetterTypes } from '~/store/account/auth'
import { GraphqlMutationResponse } from '~/types/apollo-graphql-types'

type SupportValidationData = {
  ticketAuthor: string
  authorEmail: string
  authorCC: string
  supportSubject: string
  supportText: string
}

interface FormDataT {
  fromEmail: string
  ccEmails: string
  subject: string
  body: string
  attachments?: FileUploadTokenT[]
}

const authStore = namespace('account/auth')

@Component({
  components: {
    ZInput,
    ZRichText,
    ZSelect,
    ZButton,
    ZOption,
    ZIcon,
    ZAvatar,
    ZConfirm,
    ZFileInput,
    InfoBanner
  },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  methods: { getDefaultAvatar },
  layout: 'sidebar-only'
})
export default class Support extends mixins(ActiveUserMixin) {
  private ticketAuthorId = ''
  private supportHTML = ''
  private supportSubject = ''
  private authorEmail = ''
  private authorCC = ''
  private viewerContexts = []
  private isFileProcessing = false
  private isFormSubmitting = false
  private filesToUpload = [] as File[]
  private readonly UPLOAD_ENDPOINT = this.$config.restClientUri

  @authStore.Getter(AuthGetterTypes.EXPIRY)
  tokenExpiry: number

  @authStore.Action(AuthActionTypes.REFRESH)
  refreshToken: () => Promise<void>

  get supportText(): string {
    //? This line is responsible for simply getting textual characters from the HTML string that the rich text editor component provides.
    //? Another way would be to use: new DOMParser().parseFromString(html,"text/html").documentElement.textContent
    //? But the memory overhead of using such task isn't worth it, since its just a minor validation
    //! Intentional ReDoS since better validation performed at backend
    return this.supportHTML.replace(/<[^>]+>/g, '') || ''
  }

  get ticketAuthor(): string {
    const authorFinder = (context: DashboardContext | Record<string, string>) =>
      context.id.toString() === this.ticketAuthorId
    const author = this.viewerContexts.find(authorFinder)
    if (author) {
      const authorContext = author as DashboardContext
      return `${authorContext.team_name || authorContext.login} (${
        authorContext.vcs_provider_display
      } ${authorContext.type === 'user' ? 'Account' : 'Organization'})`
    }
    return ''
  }

  /**
   * Fetch hook for the page that fetches active user information and sets the default values
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchActiveUser()
    this.authorEmail = this.viewer.email
    this.viewerContexts = this.viewer.dashboardContext
    this.ticketAuthorId = this.activeDashboardContext.id.toString()
  }

  /**
   * Validates file sizes for files
   *
   * @param {File[]} arrayOfFiles - Files whose sizes need to be validated.
   *
   * @returns boolean
   */
  validateFileSize(arrayOfFiles: File[]): boolean {
    /**
     * Function to add a given file's size to the given total number.
     *
     * @param {number} accumulator - Total size of files till now
     * @param {File} currentFile - File whose size has to be added to the total
     *
     * @returns {number} new total size of files
     */
    const sizeConcatenator = (accumulator: number, currentFile: File): number =>
      accumulator + currentFile.size

    const totalFileSize = arrayOfFiles.reduce(sizeConcatenator, 0)
    //? 10,485,760 = 10MB
    if (totalFileSize > 10_485_760) {
      this.$toast.danger('Total size of attachments should be less than 10 MB.')
      this.isFileProcessing = false
      return false
    }
    return true
  }

  /**
   * Validates names for files
   *
   * @param {File[]} arrOfFiles - Files whose name has to validated
   *
   * @returns {boolean}
   */
  validateFileNames(arrOfFiles: File[]): boolean {
    const validFilenameRegex = /^[^\:\/\\\<\>\"\|\?\*\^]{1,255}$/
    const filenameChecker = (val: File) =>
      validFilenameRegex.test(val.name) && val.name.length <= 255
    if (!arrOfFiles.every(filenameChecker)) {
      this.$toast.danger(
        'File names must be 256 characters or less and cannot contain special characters.'
      )
      return false
    }
    return true
  }

  /**
   * Validates input data and shows errors as required.
   *
   * @param {SupportValidationData} validationData - Data to validate
   *
   * @returns {boolean} - Whether data is valid (true) or not (false).
   */
  validateInputs(valdiationData: SupportValidationData): boolean {
    if (!valdiationData.ticketAuthor) {
      this.$toast.danger('Select a valid DeepSource workspace for this support request.')
      return false
    }
    if (!valdiationData.authorEmail) {
      this.$toast.danger('A primary email address is required.')
      return false
    }
    const multiEmailInput = this.$refs['multiEmailInput'] as HTMLInputElement
    multiEmailInput.value = valdiationData.authorEmail
    if (!multiEmailInput.checkValidity()) {
      this.$toast.danger('The primary email address is invalid.')
      multiEmailInput.value = ''
      return false
    }
    multiEmailInput.value = ''
    if (valdiationData.authorCC) {
      multiEmailInput.value = valdiationData.authorCC
      if (!multiEmailInput.checkValidity()) {
        this.$toast.danger('One or more email addresses added in CC are invalid.')
        multiEmailInput.value = ''
        return false
      }
      multiEmailInput.value = ''
    }
    if (!valdiationData.supportSubject || valdiationData.supportSubject.length < 5) {
      this.$toast.danger('Subject line should be 5 characters or more.')
      return false
    }
    if (valdiationData.supportSubject.length > 250) {
      this.$toast.danger('Subject line should be 250 characters or less.')
      return false
    }
    if (!valdiationData.supportText.length || valdiationData.supportText.length < 20) {
      this.$toast.danger('Description should be 20 characters or more.')
      return false
    }
    return true
  }

  /**
   * Validates and appends files to {@link filesToUpload} on `change` event of file input.
   *
   * @param {Event} event - Change event of a file
   * @param {HTMLInputElement} target
   * @returns {void}
   */
  prepareFiles({ target }: { target: HTMLInputElement }): void {
    if (target.files) {
      this.isFileProcessing = true
      const arrayOfFiles = Array.from(target.files)
      try {
        if (this.validateFileSize(arrayOfFiles) && this.validateFileNames(arrayOfFiles))
          this.filesToUpload = this.filesToUpload.concat(arrayOfFiles)
      } catch (err) {
        this.$toast.danger('An error occurred while processing files.')
      } finally {
        this.isFileProcessing = false
      }
    }
  }

  /**
   * Deletes a given file via its index from {@link filesToUpload}
   *
   * @param {number} fileIndex - Index of the file to delete
   * @returns {boolean}
   */
  removeFile(fileIndex: number): void {
    this.filesToUpload.splice(fileIndex, 1)
  }

  /**
   * Reset for data to its defaults.
   *
   * @returns {void}
   */
  resetFormData(): void {
    this.authorCC = ''
    this.supportSubject = ''
    this.supportHTML = ''
    this.filesToUpload = []
  }

  /**
   * Creates a support ticket by calling the mutation with given data.
   *
   * @param {FormDataT} formData - Data for the support ticket.
   * @returns {Promise<void>}
   */
  async submitSupportData(formData: FormDataT): Promise<void> {
    const response = (await this.$applyGraphqlMutation(SubmitSupportTicketMutation, {
      input: formData
    })) as GraphqlMutationResponse
    if (response.data.submitSupportTicket?.ok) {
      this.$toast.show({
        type: 'success',
        message:
          "We've successfully recorded your support ticket. Expect a response from our team via email shortly.",
        timeout: 5
      })
      this.resetFormData()
    } else {
      this.$toast.show({
        type: 'danger',
        message:
          'An error occurred while creating your support request. Please try submitting the form again. If the issue persists, email us at support@deepsource.io.',
        timeout: 5
      })

      this.$logErrorAndToast(new Error('Ticket response not ok'), undefined, this.viewer, {
        context: 'Support page',
        params: formData as unknown as Record<string, unknown>
      })
    }
  }

  /**
   * Checks if the auth JWT has expired and refreshes it if so.
   *
   * @returns {Promise<void>}
   */
  async updateRefreshTokenIfNeeded(): Promise<void> {
    const now = (new Date().getTime() + 30_000) / 1000
    if (now > this.tokenExpiry) {
      await this.refreshToken()
    }
  }

  /**
   * Function to validate, upload files and create support ticket on form submit.
   *
   * @returns {Promise<void>}
   */
  async createSupportTicket(): Promise<void> {
    this.isFormSubmitting = true

    //? Validate form data
    const dataToValidate: SupportValidationData = {
      authorEmail: this.authorEmail,
      authorCC: this.authorCC,
      supportSubject: this.supportSubject,
      supportText: this.supportText,
      ticketAuthor: this.ticketAuthor
    }

    if (!this.validateInputs(dataToValidate)) {
      return
    }

    const formData: FormDataT = {
      fromEmail: dataToValidate.authorEmail,
      ccEmails: dataToValidate.authorCC,
      subject: dataToValidate.supportSubject,
      body: `Account/Organization Name: ${dataToValidate.ticketAuthor} <br/> ${this.supportHTML}`
    }

    try {
      await this.updateRefreshTokenIfNeeded()
      if (process.client && this.filesToUpload.length) {
        const csrfToken = this.$cookies.get('csrftoken')
        const token = this.$store?.getters[`account/auth/${AuthGetterTypes.TOKEN}`] as string

        const fileUploadTokens = await uploadFiles(
          `${this.UPLOAD_ENDPOINT}/api/upload/`,
          FileUploadContexts.zendesk,
          this.filesToUpload,
          {
            headers: {
              'X-CSRFToken': csrfToken,
              Authorization: `JWT ${token}`
            }
          }
        )
        formData.attachments = fileUploadTokens
      }
      await this.submitSupportData(formData)
    } catch (err) {
      const tickerError = err as Error
      if (err instanceof FileUploadError) {
        this.$toast.show({
          type: 'danger',
          message: err.message,
          timeout: 5
        })
      } else if (tickerError.message === 'attachment-failed') {
        this.$toast.show({
          type: 'danger',
          message:
            'An error occurred while uploading attachments for your support request. Please upload your attachments again and submit the form. If the issue persists, please email us at support@deepsource.io.',
          timeout: 5
        })
      } else if (tickerError.message === 'ticket-creation-failed') {
        this.$toast.show({
          type: 'danger',
          message:
            'An error occurred while creating your support request. Please try submitting the form again. If the issue persists, email us at support@deepsource.io.',
          timeout: 5
        })
      } else {
        this.$toast.show({
          type: 'danger',
          message:
            'An error occurred while creating your support request. Please try submitting the form again. If the issue persists, email us at support@deepsource.io.',
          timeout: 5
        })
      }

      this.$logErrorAndToast(tickerError, undefined, this.viewer, {
        context: 'Support page',
        params: formData as unknown as Record<string, unknown>
      })
    } finally {
      this.isFormSubmitting = false
    }
  }
}
</script>

<style lang="postcss">
.z-rich-text .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  @apply h-0 pointer-events-none float-left text-slate;
}
</style>
