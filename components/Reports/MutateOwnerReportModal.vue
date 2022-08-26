<template>
  <z-modal :title="editMode ? 'Edit report' : 'Share report'" @onClose="$emit('close')">
    <fieldset v-if="!showRepoSelection" class="p-4 flex flex-col gap-y-7">
      <label for="report-title" class="space-y-2 text-sm text-vanilla-200 w-full">
        <p class="text-sm font-medium text-vanilla-100">Label</p>
        <z-input
          v-focus
          id="report-title"
          v-model="reportLabel"
          :required="true"
          :show-border="false"
          placeholder="What’s this report for?"
          size="small"
        />
        <p class="flex items-center gap-x-1 text-vanilla-400 text-xs">
          This is used for internal reference only
        </p>
      </label>

      <label v-if="reportIdOld" for="report-link" class="space-y-2 text-sm text-vanilla-200 w-full">
        <p class="text-sm font-medium text-vanilla-100">Shareable link</p>
        <z-input
          v-focus
          id="report-link"
          :value="reportUrl"
          :read-only="true"
          :show-border="false"
          placeholder="Shareable link for the report..."
        >
          <template slot="right">
            <copy-button
              v-tooltip="'Copy report shareable link'"
              :value="reportUrl"
              :icon-only="true"
            />
          </template>
        </z-input>
      </label>

      <div class="space-y-3">
        <toggle-input
          v-model="isRestricted"
          input-width="xx-small"
          label="Restrict report access"
          input-id="toggle-password-protection"
          :remove-y-padding="true"
          class="font-medium"
          @input="handlePasswordProtectedToggle"
        >
          <template slot="description">
            <p>
              {{
                isRestrictedOld && isRestricted
                  ? 'This report is password-protected'
                  : 'Password-protect this report'
              }}.
            </p>
            <z-button
              v-if="isRestrictedOld && isRestricted && !showPasswordInput"
              button-type="ghost"
              color="vanilla-100"
              size="x-small"
              icon-size="x-small"
              label="Reset password"
              icon="refresh-cw"
              class="gap-x-1 mt-1 bg-ink-200 opacity-80 hover:opacity-100"
              @click="handleResetPassword"
            />
          </template>
        </toggle-input>
        <label
          v-if="showPasswordInput"
          for="password"
          class="block text-sm font-medium text-vanilla-400"
        >
          <span class="mb-2 sr-only">Password</span>
          <div class="relative">
            <z-input
              id="password"
              v-model="password"
              :type="isPasswordHidden ? 'password' : 'text'"
              :required="isRestricted"
              :disabled="!isRestricted"
              :show-border="false"
              placeholder="A randomly generated password with at least 16 characters"
            />
            <div class="absolute flex top-1 right-1 gap-x-1 bg-ink-400">
              <z-button
                v-tooltip="isPasswordHidden ? 'Reveal password' : 'Hide password'"
                button-type="secondary"
                :icon="isPasswordHidden ? 'eye' : 'eye-off'"
                size="small"
                :disabled="!password"
                @click="togglePasswordVisibility"
              />
              <z-button
                v-tooltip="'Generate new password'"
                button-type="secondary"
                icon="refresh-cw"
                size="small"
                @click="generatePassword"
              />
              <copy-button
                v-tooltip="'Copy password'"
                :icon-only="true"
                :disabled="!password"
                :value="password"
              />
            </div>
          </div>
        </label>
      </div>

      <div class="grid grid-cols-2">
        <div class="flex flex-col gap-y-2">
          <p class="text-xs uppercase text-vanilla-400 font-medium tracking-wider">Security</p>
          <template v-for="(report, key) in ReportMeta">
            <z-checkbox
              v-if="report.type === ReportType.Compliance"
              :key="key"
              :value="key"
              v-model="reportKeys"
              :label="report.title"
              size="small"
              class="cursor-pointer"
            />
          </template>
        </div>
        <div class="flex flex-col gap-y-2">
          <p class="text-xs uppercase text-vanilla-400 font-medium tracking-wider">Insights</p>
          <template v-for="(report, key) in ReportMeta">
            <z-checkbox
              v-if="report.type === ReportType.Insight"
              :key="key"
              :value="key"
              v-model="reportKeys"
              :label="report.title"
              size="small"
              class="cursor-pointer"
            />
          </template>
        </div>
      </div>

      <toggle-input
        v-model="shareHistoricalData"
        input-width="xx-small"
        label="Share historical data"
        input-id="toggle-share-historical-data"
        :remove-y-padding="true"
        class="font-medium"
      >
        <template slot="description"> Include data from past months in the report. </template>
      </toggle-input>

      <label for="source-repos" class="space-y-2 text-sm">
        <p class="font-medium text-vanilla-100">Select repositories</p>
        <z-radio-group
          @change="handleSourceUpdate"
          v-model="reportSource"
          id="source-repos"
          class="grid grid-cols-2"
        >
          <div>
            <z-radio :value="ReportSource.SourceSelected" label="Custom repositories"></z-radio>
            <z-button
              v-if="reportSource === ReportSource.SourceSelected"
              button-type="link"
              size="x-small"
              color="vanilla-400"
              :label="`${sourcedRepositories.length} selected`"
              @click="showRepoSelection = true"
              class="ml-4 underline hover:text-vanilla-100"
            />
          </div>
          <z-radio
            :value="ReportSource.SourceAll"
            label="All repositories"
            class="place-self-start"
          ></z-radio>
        </z-radio-group>
      </label>
    </fieldset>

    <select-repositories-for-report v-else v-model="sourcedRepositories" />

    <template v-slot:footer="{ close }">
      <div class="p-4 space-x-4 text-right text-vanilla-100 border-ink-200">
        <z-button
          v-if="showRepoSelection"
          label="Go back"
          button-type="ghost"
          color="vanilla-100"
          size="small"
          icon="arrow-left"
          class="bg-ink-200"
          @click="showRepoSelection = false"
        />

        <z-button
          v-else
          icon="check"
          button-type="primary"
          size="small"
          :label="editMode ? 'Update report' : 'Create report'"
          :is-loading="saveLoading"
          :disabled="saveLoading"
          class="modal-primary-action"
          @click="handleSave(close)"
        />
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Component, Watch, Prop, Vue } from 'nuxt-property-decorator'
import Shifty from '@deepsource/shifty'
import {
  ZModal,
  ZInput,
  ZButton,
  ZAlert,
  ZSelect,
  ZOption,
  ZIcon,
  ZToggle,
  ZCheckbox,
  ZRadioGroup,
  ZRadio
} from '@deepsourcelabs/zeal'
import { ReportPageT, ReportMeta } from '~/types/reportTypes'
import {
  CreatePublicReportInput,
  ReportLevel,
  ReportSource,
  ReportType,
  UpdatePublicReportInput
} from '~/types/types'

/**
 * ? Why create and update in same modal
 *
 * On an individual report page, we have a share button. On clicking it, this modal opens with
 * the reportKeys prefilled, which is done through reprtoKeys being prop controlled.
 * Since we'll anyways need to support prop controlled reportKeys, we added support for
 * all data properties to be prop controlled. Hence this modal works for both, report creation and updation.
 */

/**
 * Create Public Report modal
 */
@Component({
  components: {
    ZModal,
    ZInput,
    ZButton,
    ZAlert,
    ZSelect,
    ZOption,
    ZIcon,
    ZToggle,
    ZCheckbox,
    ZRadioGroup,
    ZRadio
  }
})
export default class MutateOwnerReportModal extends Vue {
  // Need level as prop because CreatePublicReportInput has level as required type
  @Prop({ required: true })
  level: ReportLevel

  @Prop({ required: true })
  editMode: boolean

  @Prop({ default: '' })
  reportIdOld: string

  @Prop({ default: false })
  isRestrictedOld: boolean

  @Prop({ default: () => [] })
  reportKeysOld: Array<ReportPageT>

  @Prop({ default: false })
  shareHistoricalDataOld: boolean

  @Prop({ default: '' })
  reportLabelOld: string

  @Prop({ default: ReportSource.SourceAll })
  reportSourceOld: ReportSource

  @Prop({ default: () => [] })
  sourcedRepositoriesOld: Array<string>

  @Prop({ default: false })
  saveLoading: boolean

  isRestricted = false
  password = ''
  reportKeys: Array<ReportPageT> = []
  shareHistoricalData: boolean = false
  reportLabel = ''
  reportSource: ReportSource = ReportSource.SourceAll
  sourcedRepositories: Array<string> = []

  isPasswordHidden = false
  showPasswordInput = false
  showRepoSelection = false

  engine: Shifty
  ReportMeta = ReportMeta
  ReportType = ReportType
  ReportSource = ReportSource

  /**
   * Mounted hook to generate password
   */
  mounted() {
    this.reportKeys = this.reportKeysOld
    this.shareHistoricalData = this.shareHistoricalDataOld
    this.reportLabel = this.reportLabelOld
    this.isRestricted = this.isRestrictedOld
    this.reportSource = this.reportSourceOld
    this.sourcedRepositories = this.sourcedRepositoriesOld
  }

  get reportUrl(): string {
    return `https://${this.$config.domain}/report/${this.reportIdOld}`
  }

  /**
   * Method to handle password-protected toggle updation and, based on value received from it,
   * control visibility of password input field .
   *
   * @param passworProtected boolean
   *
   * @return void
   */
  handlePasswordProtectedToggle(passworProtected: boolean) {
    /**
     * We receive new value of password-protected toggle as argument.
     * If this new value is true, that means we need to show the password input field,
     * for which we need to also generate a new password.
     *
     * However, we want to show the password input field only if the report was not
     * password-protected already, because in that case we wan't to show the password
     * reset button.
     */
    if (passworProtected) {
      this.generatePassword()
      if (!this.isRestrictedOld) {
        this.showPasswordInput = true
      }
    } else {
      this.password = ''
      this.showPasswordInput = false
    }
  }

  /**
   * Click handler method for password reset button.
   * Generates new password and makes password input field visible.
   *
   * @return void
   */
  handleResetPassword() {
    this.generatePassword()
    this.showPasswordInput = true
  }

  /**
   * Method to set report source type
   *
   * @return void
   */
  handleSourceUpdate() {
    if (this.reportSource === ReportSource.SourceSelected) {
      this.showRepoSelection = true
    }
  }

  /**
   * Click handler button for save report button.
   *
   * @oaram close {() => void}
   *
   * @return void
   */
  handleSave(close?: () => void) {
    if (this.editMode) {
      this.emitEditReport(close)
    } else {
      this.emitCreateReport(close)
    }
  }

  /**
   * Method to build args for report creation and emit it.
   *
   * @oaram close {() => void}
   *
   * @return void
   */
  emitCreateReport(close?: () => void) {
    if (this.validateArgs()) {
      const { provider, owner: ownerLogin, repo: repositoryName } = this.$route.params
      const newReportArgs: CreatePublicReportInput = {
        ownerLogin,
        repositoryName,
        vcsProvider: this.$providerMetaMap[provider].value,
        label: this.reportLabel,
        level: this.level,
        isRestricted: this.isRestricted,
        password: this.password,
        shareHistoricalData: this.shareHistoricalData,
        reportKeys: this.reportKeys,
        source: this.reportSource,
        sourcedRepositories: this.sourcedRepositories
      }

      if (Object.keys(newReportArgs).length) {
        this.$emit('create-report', newReportArgs, close)
      }
    }
  }

  /**
   * Method to build args for report updation and emit it.
   *
   * @oaram close {() => void}
   *
   * @return void
   */
  emitEditReport(close?: () => void) {
    if (this.validateArgs()) {
      const updatedReportArgs: UpdatePublicReportInput = {
        reportId: this.reportIdOld,
        label: this.reportLabel,
        shareHistoricalData: this.shareHistoricalData,
        reportKeys: this.reportKeys,
        isRestricted: this.isRestricted,
        source: this.reportSource
      }

      if (this.reportSource === ReportSource.SourceSelected) {
        updatedReportArgs['sourcedRepositories'] = this.sourcedRepositories
      }

      if (this.isRestricted && this.password.length) {
        updatedReportArgs['password'] = this.password
      }

      if (Object.keys(updatedReportArgs).length) {
        this.$emit('edit-report', updatedReportArgs, close)
      }
    }
  }

  /**
   * Generate password using shifty
   *
   * @return {void}
   */
  generatePassword(): void {
    if (!this.engine) this.engine = new Shifty(false, 32)

    this.password = this.engine.generate()
    if (this.isPasswordHidden) {
      this.isPasswordHidden = false
      setTimeout(() => {
        this.isPasswordHidden = true
      }, 1500)
    }
  }

  /**
   * Toggle password visibility
   *
   * @return {void}
   */
  togglePasswordVisibility(): void {
    this.isPasswordHidden = !this.isPasswordHidden
  }

  /**
   * Validate arguments for create report mutation
   *
   * @return boolean
   */
  validateArgs(): boolean {
    // Check for password only if password input is shown
    if (this.showPasswordInput && !this.password) {
      this.$toast.danger("Please enter a password or disable 'Restrict report access'.")
      return false
    }

    if (!this.reportLabel) {
      this.$toast.danger('Please add a label for the report.')
      return false
    }

    if (this.reportKeys.length < 1) {
      this.$toast.danger('Please select at least one report to share.')
      return false
    }

    if (this.reportSource === ReportSource.SourceSelected && this.sourcedRepositories.length < 1) {
      this.$toast.danger('Please select at least one repository, or select all repositories.')
      return false
    }

    return true
  }

  /**
   * Close modal on route change
   *
   * @return {void}
   */
  @Watch('$route.path')
  closeModal(): void {
    this.$emit('close')
  }
}
</script>
