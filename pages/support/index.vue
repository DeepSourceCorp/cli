<template>
  <div>
    <div class="sticky z-10 top-10 lg:top-0">
      <div class="flex items-center px-4 py-4 bg-ink-300">
        <!-- ! Need a custom icon to use -->
        <!-- <z-icon icon="support" size="medium" color="vanilla-100" class="mr-2" /> -->
        <h1 class="my-px text-xl font-semibold leading-none">Contact support</h1>
      </div>
      <hr class="border-ink-200" />
    </div>
    <div class="p-4 pt-0 max-w-7xl">
      <form
        class="grid mt-4 gap-y-5"
        novalidate
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
                    type="span"
                    size="sm"
                    class="flex-shrink-0"
                    :image="context.avatar_url"
                    :fallback-image="getDefaultAvatar(context.login, context.type === 'user')"
                    :user-name="context.login"
                  />
                  <span v-show="!isCollapsed">
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
            Select account or the team on DeepSource with which this ticket is related.
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
            We'll use this email as the primary point of contact for this support ticket.
          </p>
        </div>
        <div class="space-y-1.5 max-w-lg">
          <label for="author-cc" class="text-xs">CC</label>
          <z-input
            v-model="authorCC"
            id="author-cc"
            type="email"
            :validate-on-blur="false"
            :disabled="isFormSubmitting"
            padding="px-4"
            placeholder=""
            multiple
          />
          <p class="text-vanilla-400 text-xs">
            We'll keep these email addresses in cc when communicating to you about this ticket.
          </p>
        </div>
        <div class="space-y-1.5 max-w-lg">
          <label for="support-subject" class="text-xs">Subject</label>
          <z-input
            v-model="supportSubject"
            id="support-subject"
            type="text"
            :disabled="isFormSubmitting"
            max-length="250"
            placeholder=""
            padding="px-4"
          />
        </div>
        <div class="space-y-1.5 max-w-lg">
          <label id="support-description" class="text-xs">What is the issue?</label>

          <div class="min-w-0">
            <z-rich-text
              v-model="supportHTML"
              placeholder=""
              :min-length="20"
              min-length-err-msg="Please add at least 20 characters in the issue description."
              :max-length="1024"
              :disabled="isFormSubmitting"
              :class="{ 'cursor-not-allowed': isFormSubmitting }"
              aria-labelledby="support-description"
            />
          </div>
          <p class="text-vanilla-400 text-xs">
            Please be as descriptive as possible.<br />If you're reporting a bug, please list down
            the steps you took and attach any screenshots if possible. This will help us reproduce
            the behaviour.
          </p>
        </div>
        <div class="grid items-start my-1 space-x-6 lg:grid-cols-support">
          <z-button
            type="submit"
            icon="mail"
            :disabled="isFileProcessing || isFormSubmitting"
            :is-loading="isFormSubmitting"
            loading-label="Sending request"
            label="Send request"
            size="small"
            class="justify-self-end"
          />
        </div>
      </form>
      <input ref="multiEmailInput" type="email" class="hidden" multiple />
      <portal to="modal">
        <z-confirm
          v-if="showNotif"
          primaryActionLabel="Done"
          title="Help is on it's way!"
          subtitle="We've successfully recorded your support ticket. Expect a response from our team via email shortly."
          :hide-secondary-button="true"
          @primaryAction="closeDialog"
        >
        </z-confirm>
      </portal>
    </div>
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
  ZAvatar,
  ZConfirm,
  ZFileInput
} from '@deepsourcelabs/zeal'
import { InfoBanner } from '@/components/Settings/index'
import SubmitSupportTicketMutation from '~/apollo/mutations/support/submitSupportTicket.gql'
import { AttachmentObj, getBase64Files } from '~/utils/files'
import { getDefaultAvatar } from '~/utils/ui'

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
  private supportContext = {} as DashboardContext | Record<string, string>
  private authorEmail = ''
  private authorCC = ''
  private viewerContexts = []
  private isFileProcessing = false
  private isFormSubmitting = false
  private showNotif = false

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

  validateFileSize(arrayOfFiles: File[]): boolean {
    const sizeConcatenator = (accumulator: number, currentValue: File): number =>
      accumulator + currentValue.size
    //? 5242880 = 5MB
    const filesLt5mbCheck = (file: File) => file.size <= 5242880
    const areFilesValidSize = arrayOfFiles.every(filesLt5mbCheck)
    if (!areFilesValidSize) {
      this.$toast.danger('The attachment should not be larger than 5MB.')
      this.isFileProcessing = false
      return false
    }
    const totalFileSize = arrayOfFiles.reduce(sizeConcatenator, 0)
    //? 7340032 = 7MB. Payload cap is 10MB. 7MB => ~9.33MB post base64 conversion
    //? ref: https://stackoverflow.com/questions/4715415/base64-what-is-the-worst-possible-increase-in-space-usage
    if (totalFileSize > 7340032) {
      this.$toast.danger('Total size of attachments should be less than 7MB.')
      this.isFileProcessing = false
      return false
    }
    return true
  }

  validateFileNames(arrOfFiles: File[]): boolean {
    const validFilenameRegex = /^[^\:\/\\\<\>\"\|\?\*\^]{1,255}$/
    const filenameChecker = (val: File) =>
      validFilenameRegex.test(val.name) && val.name.length <= 255
    if (!arrOfFiles.every(filenameChecker)) {
      this.$toast.danger(
        'File names must be shorter than 256 characters and cannot contain the characters :/<>"|?*^ in them.'
      )
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
    this.ticketAuthorId = this.activeDashboardContext.id.toString()
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
      throw new Error('Please add a subject with at least 5 characters.')
    }
    if (valdiationData.supportSubject.length > 250) {
      throw new Error('Please keep the subject line shorter than 250 characters.')
    }
    if (!valdiationData.supportText.length || valdiationData.supportText.length < 20) {
      throw new Error('Please add a description with at least 20 characters.')
    }
    return true
  }

  resetFormData(): void {
    this.authorCC = ''
    this.supportSubject = ''
    this.supportHTML = ''
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
          body: `Account/Organization Name: ${dataToValidate.ticketAuthor} <br/> ${this.supportHTML}`
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
          this.logErrorForUser(reqErr as Error, 'Support Page', formData)
        }
      }
    } catch (err) {
      this.$toast.danger((err as Error).message)
    } finally {
      this.isFormSubmitting = false
    }
  }
}
</script>

<style>
.z-rich-text .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  @apply h-0 pointer-events-none float-left text-slate;
}
</style>
