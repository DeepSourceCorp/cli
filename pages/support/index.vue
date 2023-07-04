<template>
  <hero-layout
    hide-logo
    :center-hero="supportPageStatus !== supportPageStatuses.default"
    body-max-width="md:max-w-2xl"
  >
    <template #header>
      <div class="-mx-5 -mt-6 border-b border-slate-400 bg-ink-300 px-4 py-3 lg:-mx-10 lg:-mt-8">
        <div class="flex items-center">
          <z-icon icon="mail" color="current" />
          <span class="ml-2"
            >Support
            <span v-if="ticketAuthorWithoutOrg" class="hidden md:inline"
              >— {{ ticketAuthorWithoutOrg }}</span
            ></span
          >
          <z-tag-v2
            v-if="supportTier"
            :type="supportTierCopy[supportTier].variant"
            class="ml-auto md:ml-3"
          >
            {{ supportTierCopy[supportTier].label }}
          </z-tag-v2>
        </div>
      </div>
    </template>
    <div v-if="supportPageStatus === supportPageStatuses.default" class="mt-16 space-y-5">
      <div class="flex min-h-7 flex-wrap items-center justify-between gap-3">
        <span class="pl-1">What can we help you with?</span>
        <a
          v-if="!$config.onPrem"
          href="https://deepsourcestatus.com"
          target="blank"
          rel="noreferrer noopener"
        >
          <z-tag-v2
            :type="platformStatus ? platformStatusCopy[platformStatus].variant : ''"
            :class="{ 'animate-pulse': !platformStatus }"
          >
            {{ platformStatus ? platformStatusCopy[platformStatus].label : 'loading' }}
          </z-tag-v2>
        </a>
      </div>
      <div class="rounded-lg border border-slate-400 bg-ink-300 bg-opacity-60 backdrop-blur-xl">
        <div class="space-y-3.5 p-6">
          <support-form-label display-name="Account related to this support ticket">
            <z-select
              id="author-account"
              :key="viewerContexts.length"
              v-model="ticketAuthorId"
              :selected="ticketAuthorId"
              :disabled="!isPartOfTeam"
              background-class="bg-ink-400"
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
            <template v-if="supportTier" #helperText>
              This team is on
              <span class="rounded-sm bg-ink-200 p-0.5"
                >{{ supportTierCopy[supportTier].label }} support</span
              >
            </template>
          </support-form-label>
          <best-effort-support
            v-if="isCommunitySupport"
            :support-tier-copy="supportTierCopy[supportTier].label"
          />
        </div>
        <hr class="border-slate-400" />
        <div class="space-y-6 p-6">
          <support-form-label display-name="What do you need help with?">
            <z-select
              id="support-category"
              v-model="supportCategory"
              background-class="bg-ink-400"
              spacing="px-4 py-2"
              text-size="text-sm"
            >
              <z-option
                v-for="category in supportCategoryOptions"
                :key="category.value"
                :label="category.label"
                :value="category.value"
                text-size="text-sm"
              />
            </z-select>
          </support-form-label>
          <component
            :is="supportComponent.componentToRender"
            v-if="supportComponent"
            v-bind="supportComponent.bind"
            v-on="supportComponent.handlers"
          />
        </div>
      </div>
    </div>
    <div
      v-else-if="
        supportPageStatus === supportPageStatuses.success ||
        supportPageStatus === supportPageStatuses.error
      "
      class="mx-auto max-w-md space-y-6 rounded-lg border border-slate-400 bg-ink-300 bg-opacity-60 p-4 text-center backdrop-blur-xl md:p-8"
    >
      <empty-state-picture
        :webp-image-path="
          supportPageStatus === supportPageStatuses.success
            ? require('~/assets/images/ui-states/issues/no-issues-found-static-140px.webp')
            : require('~/assets/images/ui-states/runs/no-recent-autofixes.webp')
        "
        :png-image-path="
          supportPageStatus === supportPageStatuses.success
            ? require('~/assets/images/ui-states/issues/no-issues-found-static-140px.png')
            : require('~/assets/images/ui-states/runs/no-recent-autofixes.webp')
        "
        alt-text=""
        width="w-22"
      />
      <div class="space-y-1.5">
        <p class="text-base font-medium leading-6 text-vanilla-200">
          {{
            supportPageStatus === supportPageStatuses.success
              ? 'Support request raised successfully'
              : 'Something went wrong :/'
          }}
        </p>
        <p class="text-sm leading-6 text-vanilla-400">
          {{
            supportPageStatus === supportPageStatuses.success
              ? 'Thank you for writing to DeepSource Support. We will take a look at it soon and follow up on email. Keep an eye on your inbox!'
              : 'We have alerted our team and they are looking into the problem. Please try filling up the form again.'
          }}
        </p>
      </div>
      <button
        class="auxillary-button mx-auto bg-ink-200 px-3 py-2 text-xs leading-3"
        @click="supportPageStatus = supportPageStatuses.default"
      >
        <span>{{
          supportPageStatus === supportPageStatuses.success ? 'Raise another request' : 'Try again'
        }}</span>
        <z-icon icon="arrow-right" size="x-small" color="current" />
      </button>
    </div>
  </hero-layout>
</template>

<script lang="ts">
import { ZAvatar, ZIcon, ZOption, ZSelect } from '@deepsource/zeal'
import { Component, mixins, namespace } from 'nuxt-property-decorator'

import GetDeepSourceStatus from '~/apollo/queries/context/deepsourceStatus.gql'
import SubmitSupportTicketMutation from '~/apollo/mutations/support/submitSupportTicket.gql'
import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'
import { AuthActionTypes, AuthGetterTypes } from '~/store/account/auth'

import { GraphqlMutationResponse, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  PlatformStatus,
  SubmitSupportTicketInput,
  SupportTierChoices,
  VcsProviderChoices
} from '~/types/types'

import { FileUploadContexts, FileUploadError, uploadFiles } from '~/utils/files'
import { getDefaultAvatar } from '~/utils/ui'
import {
  SupportReqType,
  SupportReqFormType,
  SupportFormT,
  SupportValidationData,
  SupportPageStatusT
} from '~/types/support'
import {
  SupportForm,
  SupportSecurityWarning,
  SupportFpInfo,
  SupportFeatureInfo,
  SupportIssueNotListed
} from '~/components/Support'

const authStore = namespace('account/auth')

const STATUS_COPY = {
  [PlatformStatus.Degraded]: { label: 'Services degraded', variant: 'honey' },
  [PlatformStatus.Downtime]: { label: 'Brief downtime', variant: 'cherry' },
  [PlatformStatus.Operational]: { label: 'All systems operational', variant: 'juniper' },
  error: { label: 'Error', variant: 'cherry' }
}

@Component({
  components: {
    ZSelect,
    ZOption,
    ZIcon,
    ZAvatar,
    SupportForm,
    SupportSecurityWarning,
    SupportFpInfo,
    SupportFeatureInfo,
    SupportIssueNotListed
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
  private authorEmail = ''
  private ownerLogin = ''
  private ownerVCSProvider = '' as VcsProviderChoices
  private viewerContexts = []
  private filesToUpload: File[] = []
  private isFormSubmitting = false
  private readonly UPLOAD_ENDPOINT = this.$config.restClientUri
  private supportCategory: SupportReqType | '' = ''
  private supportPageStatus: SupportPageStatusT = SupportPageStatusT.default
  supportPageStatuses = SupportPageStatusT
  private platformStatus: keyof typeof STATUS_COPY | '' = ''
  private isNotOnboarded = false

  @authStore.Getter(AuthGetterTypes.EXPIRY)
  tokenExpiry: number

  @authStore.Action(AuthActionTypes.REFRESH)
  refreshToken: () => Promise<void>

  readonly supportCategoryOptions = [
    { value: SupportReqType.ACC_OR_BILL, label: 'Account and billing', tag: 'account' },
    { value: SupportReqType.SECURITY, label: 'Report a security vulnerability', tag: 'others' },
    { value: SupportReqType.FP, label: 'Report a false positive', tag: 'others' },
    { value: SupportReqType.BUG, label: 'Report a bug', tag: 'bug' },
    { value: SupportReqType.FEATURE, label: 'Request a feature', tag: 'others' },
    { value: SupportReqType.FEEDBACK, label: 'Share feedback', tag: 'feedback' },
    { value: SupportReqType.NOT_LISTED, label: 'My issue is not listed', tag: 'others' }
  ]

  readonly supportTierCopy = {
    [SupportTierChoices.Community]: { label: 'Community', variant: 'robin' },
    [SupportTierChoices.Standard]: { label: 'Standard', variant: 'aqua' },
    [SupportTierChoices.Enterprise]: { label: 'Enterprise', variant: 'juniper' }
  }

  readonly platformStatusCopy = STATUS_COPY

  get formBinds() {
    return {
      authorEmail: this.authorEmail,
      isSubmittingForm: this.isFormSubmitting,
      filesToUpload: this.filesToUpload
    }
  }

  get formHandlers() {
    return {
      'files-change': this.setFilesToUpload,
      submit: this.createSupportTicket
    }
  }

  get listOfForm(): Record<SupportReqType, SupportFormT> {
    return {
      [SupportReqType.ACC_OR_BILL]: {
        type: SupportReqFormType.COMMON,
        componentToRender: 'SupportForm',
        bind: this.formBinds,
        handlers: this.formHandlers
      },
      [SupportReqType.SECURITY]: {
        type: SupportReqFormType.COMMON,
        componentToRender: 'SupportSecurityWarning',
        bind: false,
        handlers: false
      },
      [SupportReqType.FP]: {
        type: SupportReqFormType.COMMON,
        componentToRender: 'SupportFpInfo',
        bind: false,
        handlers: false
      },
      [SupportReqType.BUG]: {
        type: SupportReqFormType.COMMON,
        componentToRender: 'SupportForm',
        bind: this.formBinds,
        handlers: this.formHandlers
      },
      [SupportReqType.FEATURE]: {
        type: SupportReqFormType.COMMON,
        componentToRender: 'SupportFeatureInfo',
        bind: false,
        handlers: false
      },
      [SupportReqType.FEEDBACK]: {
        type: SupportReqFormType.COMMON,
        componentToRender: 'SupportForm',
        bind: this.formBinds,
        handlers: this.formHandlers
      },
      [SupportReqType.NOT_LISTED]: {
        type: SupportReqFormType.PER_TYPE,
        COMMUNITY: {
          componentToRender: 'SupportIssueNotListed',
          bind: {
            supportTier: this.supportTier ? this.supportTierCopy[this.supportTier].label : ''
          },
          handlers: false
        },
        ENTERPRISE: {
          componentToRender: 'SupportForm',
          bind: this.formBinds,
          handlers: this.formHandlers
        },
        STANDARD: {
          componentToRender: 'SupportForm',
          bind: this.formBinds,
          handlers: this.formHandlers
        }
      }
    }
  }

  get isCommunitySupport() {
    return this.supportTier === SupportTierChoices.Community
  }

  get ticketAuthor() {
    const authorFinder = (context: DashboardContext | Record<string, string>) =>
      context.id.toString() === this.ticketAuthorId
    return this.viewerContexts.find(authorFinder) as DashboardContext | undefined
  }

  get supportTier() {
    return this.isNotOnboarded
      ? SupportTierChoices.Community
      : this.ticketAuthor?.support_tier || ''
  }

  get supportComponent() {
    if (this.supportCategory && this.supportTier) {
      const supportComp = this.listOfForm[this.supportCategory]
      return supportComp.type === SupportReqFormType.COMMON
        ? {
            componentToRender: supportComp.componentToRender,
            bind: supportComp.bind,
            handlers: supportComp.handlers
          }
        : {
            componentToRender: supportComp[this.supportTier].componentToRender,
            bind: supportComp[this.supportTier].bind,
            handlers: supportComp[this.supportTier].handlers
          }
    }
    return false
  }

  get ticketAuthorName() {
    if (this.ticketAuthor) {
      return `${this.ticketAuthorWithoutOrg} (${this.ticketAuthor.vcs_provider_display} ${
        this.ticketAuthor.type === 'user' ? 'Account' : 'Organization'
      })`
    }
    return ''
  }

  get ticketAuthorWithoutOrg() {
    return this.ticketAuthor?.team_name ?? this.ticketAuthor?.login ?? ''
  }

  get isPartOfTeam(): boolean {
    return Boolean(this.viewerContexts?.length)
  }

  async fetchDeepSourceStatus() {
    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        GetDeepSourceStatus,
        {},
        true
      )

      if (response.data.context?.platformStatus) {
        this.platformStatus = response.data.context?.platformStatus
      }
    } catch (err) {
      this.platformStatus = 'error'
      this.$logErrorAndToast(
        err as Error,
        'An error occurred while fetching DeepSource status. Please check our status on deepsourcestatus.com.'
      )
    }
  }

  /**
   * Fetch hook for the page that fetches active user information and sets the default values
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    if (!this.$config.onPrem) {
      this.fetchDeepSourceStatus()
    }

    if (!this.viewer.email || !this.viewer.dashboardContext) {
      await this.fetchActiveUser()
    }
    if (!this.viewer.dashboardContext?.length) {
      this.isNotOnboarded = true
    }
    this.authorEmail = this.viewer.email
    this.viewerContexts = this.viewer.dashboardContext
    this.ticketAuthorId = this.activeDashboardContext.id.toString()
    this.ownerLogin = this.activeDashboardContext?.login || ''
    this.ownerVCSProvider =
      this.$providerMetaMap[this.activeDashboardContext?.vcs_provider].value || ''
  }

  setFilesToUpload(newFiles: File[]) {
    this.filesToUpload = newFiles
  }

  /**
   * Reset for data to its defaults.
   *
   * @returns {void}
   */
  resetFormData(): void {
    this.supportCategory = ''
    this.filesToUpload = []
  }

  /**
   * Creates a support ticket by calling the mutation with given data.
   *
   * @param {FormDataT} formData - Data for the support ticket.
   * @returns {Promise<void>}
   */
  async submitSupportData(formData: SubmitSupportTicketInput): Promise<void> {
    // Send owner `login` if not on prem
    if (!this.$config.onPrem && this.ticketAuthor?.login && this.ticketAuthor?.vcs_provider) {
      formData.ownerLogin = this.ticketAuthor.login
      formData.vcsProvider = this.$providerMetaMap[this.ticketAuthor.vcs_provider].value
    }

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
      this.supportPageStatus = SupportPageStatusT.success
      this.resetFormData()
    } else {
      throw Error('Ticket response not ok')
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
  async createSupportTicket(validatedFormData: SupportValidationData): Promise<void> {
    this.isFormSubmitting = true

    const { ccEmails, fromEmail, subject, supportHTML } = validatedFormData

    const tag = this.supportCategoryOptions.find(
      (option) => option.value === this.supportCategory
    )?.tag

    const formData: SubmitSupportTicketInput = {
      fromEmail,
      ccEmails,
      subject,
      body: `Account/Organization Name: ${
        this.isPartOfTeam ? this.ticketAuthorName : 'Not part of any team'
      } <br/> ${supportHTML}`,
      tags: tag ? [tag] : null
    }

    try {
      await this.updateRefreshTokenIfNeeded()
      if (process.client && this.filesToUpload.length) {
        const csrfToken = this.$cookies.get('csrftoken')
        const token = this.$store?.getters[`account/auth/${AuthGetterTypes.TOKEN}`] as string

        const fileUploadTokens = await uploadFiles(
          `${this.UPLOAD_ENDPOINT}`,
          FileUploadContexts.zendesk,
          this.filesToUpload,
          {
            headers: {
              'X-CSRFToken': csrfToken,
              Authorization: `JWT ${token}`
            }
          }
        )
        formData.attachments = fileUploadTokens.map((uploadToken) => ({
          token: uploadToken.token,
          filename: uploadToken.filename
        }))
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
        this.supportPageStatus = SupportPageStatusT.error
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
