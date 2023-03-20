<template>
  <div class="relative min-h-screen space-y-12 overflow-hidden p-6">
    <div class="bg-gradient"></div>

    <img
      src="~/assets/images/logo-wordmark-white.svg"
      alt="DeepSource"
      class="mx-auto mt-12 h-5 w-auto"
    />

    <div class="space-y-6">
      <div v-if="step < 2" class="space-y-4">
        <h1
          class="mx-auto max-w-xs text-center text-2xl font-bold text-vanilla-100 md:max-w-md md:text-2.5xl lg:max-w-lg"
        >
          {{ title }}
        </h1>

        <p
          class="mx-auto max-w-xs text-center text-sm font-medium text-vanilla-400 md:max-w-md md:text-base lg:max-w-lg"
        >
          {{ subtitle }}
        </p>
      </div>

      <form
        v-if="step === 0"
        novalidate
        class="mx-auto max-w-2xl space-y-4 rounded-md border border-ink-200 bg-ink-300 bg-opacity-60 px-10 py-8 md:space-y-6"
        @submit.prevent="validateForm"
      >
        <form-field
          :err-condition="nameField.errCondition"
          :id="nameField.id"
          :label="nameField.label"
        >
          <z-input
            :id="nameField.id"
            v-model="name"
            :disabled="isFormSubmitting"
            padding="px-4"
            placeholder="Enter your name"
            type="text"
            class="hidden text-base md:flex"
            @input="resetErrorState(nameField.key, nameField.initErrors)"
          />

          <z-input
            :id="nameField.id"
            v-model="name"
            :disabled="isFormSubmitting"
            padding="px-4"
            placeholder="Enter your name"
            size="small"
            type="text"
            class="text-sm md:hidden"
            @input="resetErrorState(nameField.key, nameField.initErrors)"
          />
        </form-field>

        <form-field
          :id="workEmailField.id"
          :err-condition="workEmailField.errCondition"
          :err-msg="workEmailField.errMsg"
          :label="workEmailField.label"
        >
          <z-input
            :id="workEmailField.id"
            v-model="workEmail"
            :disabled="isFormSubmitting"
            padding="px-4"
            placeholder="norris@quackatron.com"
            type="email"
            class="hidden text-base md:flex"
            @input="resetErrorState(workEmailField.key, workEmailField.initErrors)"
          />

          <z-input
            :id="workEmailField.id"
            v-model="workEmail"
            :disabled="isFormSubmitting"
            padding="px-4"
            placeholder="norris@quackatron.com"
            size="small"
            type="email"
            class="text-sm md:hidden"
            @input="resetErrorState(workEmailField.key, workEmailField.initErrors)"
          />
        </form-field>

        <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <form-field
            :id="jobTitleField.id"
            :err-condition="jobTitleField.errCondition"
            :label="jobTitleField.label"
          >
            <z-input
              :id="jobTitleField.id"
              v-model="jobTitle"
              :disabled="isFormSubmitting"
              padding="px-4"
              placeholder="Quacker-in-chief"
              type="text"
              class="hidden text-base md:flex"
              @input="resetErrorState(jobTitleField.key, jobTitleField.initErrors)"
            />

            <z-input
              :id="jobTitleField.id"
              v-model="jobTitle"
              :disabled="isFormSubmitting"
              padding="px-4"
              placeholder="Quacker-in-chief"
              size="small"
              type="text"
              class="text-sm md:hidden"
              @input="resetErrorState(jobTitleField.key, jobTitleField.initErrors)"
            />
          </form-field>

          <form-field
            :id="companyNameField.id"
            :err-condition="companyNameField.errCondition"
            :label="companyNameField.label"
          >
            <z-input
              :id="companyNameField.id"
              v-model="companyName"
              :disabled="isFormSubmitting"
              padding="px-4"
              placeholder="Quackatron.corp"
              type="text"
              class="hidden text-base md:flex"
              @input="resetErrorState(companyNameField.key, companyNameField.initErrors)"
            />

            <z-input
              :id="companyNameField.id"
              v-model="companyName"
              :disabled="isFormSubmitting"
              padding="px-4"
              placeholder="Quackatron.corp"
              size="small"
              type="text"
              class="text-sm md:hidden"
              @input="resetErrorState(companyNameField.key, companyNameField.initErrors)"
            />
          </form-field>
        </div>

        <form-field
          :id="seatsCountField.id"
          :err-condition="seatsCountField.errCondition"
          :label="seatsCountField.label"
        >
          <z-select
            :id="seatsCountField.id"
            v-model="seatsCount"
            max-height="max-h-65"
            placeholder="Select no. of developers"
            spacing="px-4 py-2"
            text-size="text-base"
            class="hidden md:block"
            @change="resetErrorState(seatsCountField.key, seatsCountField.initErrors)"
          >
            <z-option
              v-for="seatsCountOption in seatsCountOptions"
              :key="seatsCountOption.value"
              :label="seatsCountOption.label"
              :value="seatsCountOption.value"
              text-size="text-sm"
            />
          </z-select>

          <z-select
            :id="seatsCountField.id"
            v-model="seatsCount"
            max-height="max-h-65"
            placeholder="Select no. of developers"
            spacing="px-4 py-1"
            text-size="text-sm"
            class="md:hidden"
            @change="resetErrorState(seatsCountField.key, seatsCountField.initErrors)"
          >
            <z-option
              v-for="seatsCountOption in seatsCountOptions"
              :key="seatsCountOption.value"
              :label="seatsCountOption.label"
              :value="seatsCountOption.value"
            />
          </z-select>
        </form-field>

        <form-field
          :id="vcsProviderField.id"
          :err-condition="vcsProviderField.errCondition"
          :label="vcsProviderField.label"
        >
          <z-select
            :id="vcsProviderField.id"
            v-model="vcsProvider"
            max-height="max-h-65"
            placeholder="Select your source code hosting provider"
            spacing="px-4 py-2"
            text-size="text-base"
            class="hidden md:block"
            @change="resetErrorState(vcsProviderField.key, vcsProviderField.initErrors)"
          >
            <z-option
              v-for="provider in vcsProviders"
              :key="provider.value"
              :label="provider.label"
              :value="provider.value"
              text-size="text-sm"
            />
          </z-select>

          <z-select
            :id="vcsProviderField.id"
            v-model="vcsProvider"
            max-height="max-h-65"
            placeholder="Select your source code hosting provider"
            spacing="px-4 py-1"
            text-size="text-sm"
            class="md:hidden"
            @change="resetErrorState(vcsProviderField.key, vcsProviderField.initErrors)"
          >
            <z-option
              v-for="provider in vcsProviders"
              :key="provider.value"
              :label="provider.label"
              :value="provider.value"
            />
          </z-select>
        </form-field>

        <form-field
          :id="purposeOfRequestField.id"
          :err-condition="purposeOfRequestField.errCondition"
          :label="purposeOfRequestField.label"
        >
          <z-textarea
            :id="purposeOfRequestField.id"
            v-model="purposeOfRequest"
            text-size="base"
            class="hidden border-slate-400 bg-ink-400 text-vanilla-300 focus-within:border-vanilla-400 md:flex"
            @input="resetErrorState(purposeOfRequestField.key, purposeOfRequestField.initErrors)"
          />

          <z-textarea
            :id="purposeOfRequestField.id"
            v-model="purposeOfRequest"
            text-size="sm"
            class="border-slate-400 bg-ink-400 text-vanilla-300 focus-within:border-vanilla-400 md:hidden"
            @input="resetErrorState(purposeOfRequestField.key, purposeOfRequestField.initErrors)"
          />
        </form-field>

        <button
          :disabled="isFormSubmitting"
          :class="{ 'cursor-not-allowed opacity-50': isFormSubmitting }"
          class="flex h-10 w-full flex-shrink-0 items-center justify-center gap-x-2 rounded-md border border-ink-50 bg-ink-200 px-4 py-2 text-base font-medium leading-8 text-vanilla-100 hover:bg-ink-100"
        >
          <z-icon
            :icon="isFormSubmitting ? 'spin-loader' : 'check'"
            color="vanilla-100"
            size="base"
            :class="{ 'animate-spin': isFormSubmitting }"
          />
          <span>Submit request</span>
        </button>

        <!-- Hidden input field to check if the email field is valid -->
        <input ref="email-input" type="email" class="hidden" />
      </form>

      <pilot-evaluation-agreement v-else-if="step === 1" :content="content">
        <template #action>
          <z-alert type="neutral" class="border border-ink-100">
            <div class="space-y-3 px-4 py-2.5">
              <p class="text-sm leading-7 text-vanilla-400">
                By typing your name as a signature, you represent and warrant that (1) you are
                authorized to accept and agree to the terms of this agreement on behalf of yourself
                and/or the entity you represent and (2) you intend to enter into and to be bound by
                the terms of this agreement.
              </p>

              <div class="flex flex-col flex-nowrap items-center gap-3 md:flex-row">
                <z-input
                  v-model="confirmName"
                  padding="px-4"
                  placeholder="Scott Fitzgerald"
                  class="hidden text-base md:flex"
                />

                <z-input
                  v-model="confirmName"
                  padding="px-4"
                  placeholder="Scott Fitzgerald"
                  size="small"
                  class="text-sm md:hidden"
                />

                <z-button
                  :is-loading="isSubmittingRequest"
                  :disabled="actionDisabled"
                  button-type="primary"
                  icon="check"
                  loading-label="Submitting request"
                  class="hidden md:inline-flex"
                  @click="sendRequest"
                  >Accept and submit</z-button
                >

                <z-button
                  :is-loading="isSubmittingRequest"
                  :disabled="actionDisabled"
                  button-type="primary"
                  icon="check"
                  loading-label="Submitting request"
                  size="small"
                  class="w-full md:hidden"
                  @click="sendRequest"
                  >Accept and submit</z-button
                >
              </div>
            </div>
          </z-alert>
        </template>
      </pilot-evaluation-agreement>

      <template v-else>
        <empty-state
          v-if="isSuccess"
          :webp-image-path="
            require('~/assets/images/ui-states/issues/no-issues-found-static-140px.webp')
          "
          :png-image-path="
            require('~/assets/images/ui-states/issues/no-issues-found-static-140px.png')
          "
          padding="px-3.5 py-12 md:px-12"
          subtitle="Thank you for submitting more information about what you're looking for. We will review the request shortly and reach out to you."
          title="We have received your request"
          class="mx-auto mt-52 max-w-sm rounded-md border border-slate-400 bg-ink-300 bg-opacity-60 md:py-12 lg:max-w-lg"
        />

        <empty-state
          v-else-if="isFailure"
          :webp-image-path="require('~/assets/images/ui-states/runs/no-recent-autofixes.webp')"
          padding="px-3.5 py-12 md:px-12"
          subtitle="We have alerted our team and they are looking into the problem. Please try filling up the form again."
          title="Something went wrong :/"
          class="mx-auto mt-52 max-w-sm rounded-md border border-slate-400 bg-ink-300 bg-opacity-60 md:py-12 lg:max-w-lg"
        >
          <template #action>
            <button
              class="flex h-10 w-full flex-shrink-0 items-center justify-center gap-x-2 rounded-md border border-ink-50 bg-ink-200 px-4 py-2 text-base font-medium leading-8 text-vanilla-100 hover:bg-ink-100"
              @click="step = 0"
            >
              <div class="inline-flex items-center gap-x-2 text-vanilla-100">
                <h3>Try again</h3>
                <z-icon icon="arrow-right" />
              </div>
            </button>
          </template>
        </empty-state>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ZAlert, ZButton, ZIcon, ZInput, ZTextarea, ZSelect, ZOption } from '@deepsource/zeal'

import { Context } from '@nuxt/types'

import RequestEnterprisePilotLicenseGQLMutation from '~/apollo/mutations/marketing/requestEnterprisePilotLicense.gql'
import {
  EnterprisePilotLicenseSeatChoices,
  EnterprisePilotLicenseVcsChoices,
  RequestEnterprisePilotLicenseInput
} from '~/types/types'

enum FormFields {
  NAME = 'name',
  WORK_EMAIL = 'workEmail',
  JOB_TITLE = 'jobTitle',
  COMPANY_NAME = 'companyName',
  SEATS_COUNT = 'seatsCount',
  VCS_PROVIDER = 'vcsProvider',
  PURPOSE_OF_REQUEST = 'purposeOfRequest'
}

enum FormFieldErrorKeys {
  EMPTY = 'empty',
  VALID = 'valid'
}

type FormFieldErrorT = { empty: boolean | null; valid?: boolean | null }

type FormFieldsDataT = {
  key: FormFields
  label: string
  id: string
  errCondition: boolean | null
  errMsg?: string
  initErrors: Array<FormFieldsErrorT>
}

type FormFieldsErrorT = { key: FormFieldErrorKeys; condition?: boolean; value: boolean | null }

type FormFieldsInfoT = Array<{
  field: FormFields
  errors: Array<FormFieldsErrorT>
}>

@Component({
  components: {
    ZAlert,
    ZButton,
    ZIcon,
    ZInput,
    ZTextarea,
    ZSelect,
    ZOption
  }
})
export default class RequestPilotLicense extends Vue {
  step = 0

  fieldRequirementsAreMet = false
  isFailure = false
  isSuccess = false
  isFormSubmitting = false
  isSubmittingRequest = false

  name = ''
  confirmName = ''
  workEmail = ''
  jobTitle = ''
  companyName = ''
  seatsCount = '' as EnterprisePilotLicenseSeatChoices
  vcsProvider = '' as EnterprisePilotLicenseVcsChoices
  purposeOfRequest = ''

  timerId: ReturnType<typeof setTimeout>

  // Holds a reference to the error state corresponding to all the form fields
  // It's updated in the `setError` method
  errors: Record<FormFields, FormFieldErrorT> = {
    [FormFields.NAME]: { empty: false },
    [FormFields.WORK_EMAIL]: { empty: false, valid: null },
    [FormFields.JOB_TITLE]: { empty: false },
    [FormFields.COMPANY_NAME]: { empty: false },
    [FormFields.SEATS_COUNT]: { empty: false },
    [FormFields.VCS_PROVIDER]: { empty: false },
    [FormFields.PURPOSE_OF_REQUEST]: { empty: false }
  }

  seatsCountOptions = [
    { label: 'Below 50', value: EnterprisePilotLicenseSeatChoices.Blw_50 },
    { label: '50-99', value: EnterprisePilotLicenseSeatChoices.Btw_50_99 },
    { label: '100-249', value: EnterprisePilotLicenseSeatChoices.Btw_100_249 },
    { label: '250-499', value: EnterprisePilotLicenseSeatChoices.Btw_250_499 },
    { label: '500-999', value: EnterprisePilotLicenseSeatChoices.Btw_500_999 },
    { label: '1000-2499', value: EnterprisePilotLicenseSeatChoices.Btw_1000_2499 },
    { label: '2500-4999', value: EnterprisePilotLicenseSeatChoices.Btw_2500_4999 },
    { label: '5000+', value: EnterprisePilotLicenseSeatChoices.Abv_5000 }
  ]

  vcsProviders = [
    { label: 'GitHub Cloud (github.com)', value: EnterprisePilotLicenseVcsChoices.GithubCloud },
    {
      label: 'GitHub Enterprise Server',
      value: EnterprisePilotLicenseVcsChoices.GithubEnterpriseServer
    },
    {
      label: 'GitHub Enterprise Cloud',
      value: EnterprisePilotLicenseVcsChoices.GithubEnterpriseCloud
    },
    { label: 'GitLab Cloud (Gitlab.com)', value: EnterprisePilotLicenseVcsChoices.GitlabCloud },
    {
      label: 'GitLab Community Edition',
      value: EnterprisePilotLicenseVcsChoices.GitlabSelfHostedCe
    },
    {
      label: 'GitLab Enterprise Edition',
      value: EnterprisePilotLicenseVcsChoices.GitlabSelfHostedEe
    },
    { label: 'Bitbucket Cloud', value: EnterprisePilotLicenseVcsChoices.BitbucketCloud },
    { label: 'Azure DevOps Services', value: EnterprisePilotLicenseVcsChoices.AzureDevopsServices }
  ]

  async asyncData({ $content }: Context) {
    const content = await $content('pilot-evaluation-agreement').fetch()

    return { content }
  }

  mounted() {
    window.addEventListener('beforeunload', this.confirmBeforeLeave)
  }

  beforeDestroy() {
    window.removeEventListener('beforeunload', this.confirmBeforeLeave)
    clearTimeout(this.timerId)
  }

  get actionDisabled(): boolean {
    return this.name !== this.confirmName
  }

  get title(): string {
    return this.step === 0
      ? 'Request a pilot license for Enterprise Server'
      : 'Pilot evaluation agreement'
  }

  get subtitle(): string {
    return this.step === 0
      ? `Please fill in this form to help us understand more about your use-case. After you submit, we'll get back to you with the license.`
      : 'Please read the agreement carefully and provide your consent at the bottom.'
  }

  get nameField(): FormFieldsDataT {
    return {
      key: FormFields.NAME,
      label: 'Your name',
      id: 'name',
      errCondition: this.errors[FormFields.NAME][FormFieldErrorKeys.EMPTY],
      initErrors: [{ key: FormFieldErrorKeys.EMPTY, value: false }]
    }
  }

  get workEmailField(): FormFieldsDataT {
    const errMsg = this.errors[FormFields.WORK_EMAIL][FormFieldErrorKeys.EMPTY]
      ? 'This is a required field.'
      : 'Please enter a valid email.'

    return {
      key: FormFields.WORK_EMAIL,
      label: 'Work email address',
      id: 'work-email',
      errCondition:
        this.errors[FormFields.WORK_EMAIL][FormFieldErrorKeys.EMPTY] ||
        this.errors[FormFields.WORK_EMAIL][FormFieldErrorKeys.VALID] === false,
      errMsg,
      initErrors: [
        { key: FormFieldErrorKeys.EMPTY, value: false },
        { key: FormFieldErrorKeys.VALID, value: null }
      ]
    }
  }

  get jobTitleField(): FormFieldsDataT {
    return {
      key: FormFields.JOB_TITLE,
      label: 'Job title',
      id: 'job-title',
      errCondition: this.errors[FormFields.JOB_TITLE][FormFieldErrorKeys.EMPTY],
      initErrors: [{ key: FormFieldErrorKeys.EMPTY, value: false }]
    }
  }

  get companyNameField(): FormFieldsDataT {
    return {
      key: FormFields.COMPANY_NAME,
      label: 'Company name',
      id: 'company-name',
      errCondition: this.errors[FormFields.COMPANY_NAME][FormFieldErrorKeys.EMPTY],
      initErrors: [{ key: FormFieldErrorKeys.EMPTY, value: false }]
    }
  }

  get seatsCountField(): FormFieldsDataT {
    return {
      key: FormFields.SEATS_COUNT,
      label: 'No. of seats required for the pilot',
      id: 'seats-count',
      errCondition: this.errors[FormFields.SEATS_COUNT][FormFieldErrorKeys.EMPTY],
      initErrors: [{ key: FormFieldErrorKeys.EMPTY, value: false }]
    }
  }

  get vcsProviderField(): FormFieldsDataT {
    return {
      key: FormFields.VCS_PROVIDER,
      label: 'Which source code hosting provider do you use?',
      id: 'vcs-provider',
      errCondition: this.errors[FormFields.VCS_PROVIDER][FormFieldErrorKeys.EMPTY],
      initErrors: [{ key: FormFieldErrorKeys.EMPTY, value: false }]
    }
  }

  get purposeOfRequestField(): FormFieldsDataT {
    return {
      key: FormFields.PURPOSE_OF_REQUEST,
      label: 'Purpose of requesting the pilot license',
      id: 'purpose-of-request',
      errCondition: this.errors[FormFields.PURPOSE_OF_REQUEST][FormFieldErrorKeys.EMPTY],
      initErrors: [{ key: FormFieldErrorKeys.EMPTY, value: false }]
    }
  }

  get formFieldWithValueExists(): boolean {
    const formFieldValues = [
      this.name,
      this.workEmail,
      this.jobTitle,
      this.companyName,
      this.seatsCount,
      this.vcsProvider,
      this.purposeOfRequest
    ]

    return formFieldValues.some(Boolean)
  }

  confirmBeforeLeave(e: Event) {
    // Return early if in the final step
    if (this.step === 2) {
      return
    }

    // Return early if no fields have a value in the first step
    if (this.step === 0 && !this.formFieldWithValueExists) {
      return
    }

    // Cancel the event as stated by the standard
    e.preventDefault()

    // Chrome requires returnValue to be set
    e.returnValue = false
  }

  // Method to set errors triggered on the form field value change event
  resetErrorState(field: FormFields, errors: Array<FormFieldsErrorT>) {
    errors.forEach(({ key, value }) => {
      this.setError(field, key, value)
    })
  }

  setError(fieldKey: FormFields, errorKey: keyof FormFieldErrorT, value: boolean | null) {
    // Fields should have an expected value
    this.fieldRequirementsAreMet =
      errorKey === FormFieldErrorKeys.EMPTY ? value === false : value === null || value === true

    this.errors[fieldKey][errorKey] = value
  }

  validateForm() {
    const emailInput = this.$refs['email-input'] as HTMLInputElement
    emailInput.value = this.workEmail

    const formFieldsInfo: FormFieldsInfoT = [
      {
        field: FormFields.NAME,
        errors: [{ key: FormFieldErrorKeys.EMPTY, condition: !this.name, value: true }]
      },
      {
        field: FormFields.WORK_EMAIL,
        errors: [
          { key: FormFieldErrorKeys.EMPTY, condition: !this.workEmail, value: true },
          {
            key: FormFieldErrorKeys.VALID,
            condition: !emailInput.checkValidity(),
            value: false
          }
        ]
      },
      {
        field: FormFields.JOB_TITLE,
        errors: [{ key: FormFieldErrorKeys.EMPTY, condition: !this.jobTitle, value: true }]
      },
      {
        field: FormFields.COMPANY_NAME,
        errors: [{ key: FormFieldErrorKeys.EMPTY, condition: !this.companyName, value: true }]
      },
      {
        field: FormFields.SEATS_COUNT,
        errors: [{ key: FormFieldErrorKeys.EMPTY, condition: !this.seatsCount, value: true }]
      },
      {
        field: FormFields.VCS_PROVIDER,
        errors: [{ key: FormFieldErrorKeys.EMPTY, condition: !this.vcsProvider, value: true }]
      },
      {
        field: FormFields.PURPOSE_OF_REQUEST,
        errors: [{ key: FormFieldErrorKeys.EMPTY, condition: !this.purposeOfRequest, value: true }]
      }
    ]

    formFieldsInfo.forEach(({ field, errors }) => {
      errors.forEach(({ key, condition, value }) => {
        if (condition) {
          this.setError(field, key, value)
        }
      })
    })

    emailInput.value = ''

    if (this.fieldRequirementsAreMet) {
      this.isFormSubmitting = true

      this.timerId = setTimeout(() => {
        this.step++

        this.isFormSubmitting = false
      }, 1000)
    }
  }

  async sendRequest() {
    if (this.actionDisabled) {
      return
    }

    this.isSubmittingRequest = true

    try {
      const input: RequestEnterprisePilotLicenseInput = {
        name: this.name,
        email: this.workEmail,
        jobTitle: this.jobTitle,
        companyName: this.companyName,
        seats: this.seatsCount,
        vcs: this.vcsProvider,
        purpose: this.purposeOfRequest
      }
      await this.$applyGraphqlMutation(RequestEnterprisePilotLicenseGQLMutation, { input })

      this.isSuccess = true
    } catch (err) {
      this.isFailure = true
    } finally {
      this.step++
      this.isSubmittingRequest = false
    }
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.bg-gradient {
  position: absolute;
  width: 956px;
  height: 854px;
  left: -298px;
  top: -530px;
  margin-left: auto;
  margin-right: auto;

  background: linear-gradient(
    180deg,
    rgba(69, 175, 220, 0.6) 64.4%,
    rgba(59, 100, 236, 0.6) 76.78%,
    rgba(69, 104, 220, 0) 100%
  );
  opacity: 0.12;
  box-shadow: 0px 10.5635px 660.221px 5281.77px rgba(0, 0, 0, 0.25);
  filter: blur(158.453px);
}

@media screen and (min-width: 768px) {
  .bg-gradient {
    width: 75%;
    left: 0;
    right: 0;
  }
}

.max-h-65 {
  max-height: 260px;
}
</style>
